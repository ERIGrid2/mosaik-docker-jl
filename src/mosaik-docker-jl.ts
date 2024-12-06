import { URLExt } from '@jupyterlab/coreutils';

import {
  KernelManager,
  KernelMessage,
  ServerConnection
} from '@jupyterlab/services';

import { UUID } from '@lumino/coreutils';

/**
 * This namespace contains the interface definitions and methods required
 * for the low-level interaction with the functionality provided by
 * package mosaik_docker_jl on the server.
 */
export namespace MosaikDockerAPI {
  /**
   * Return type for low-level server API calls.
   */
  export interface IRequestResponse {
    code: number;
    message?: any;
    error?: string;
  }

  /**
   * Return type for low-level results from executing code on the server.
   */
  export interface IExecuteResponse {
    status: string;
    error?: string;
  }

  /**
   * Send an HTTP request to the server (mosaik_docker_jl backend).
   * The request will be parsed there and the appropriate API will be called (blocking).
   * The results from this API call are then returned (asynchronously).
   * @param endPoint - request endpoints (as defined by the mosaik_docker_jl backend)
   *
   * @param method - HTTP method
   * @param request - payload of HTTP request
   * @returns Low-level API response
   */
  export async function sendRequest(
    endPoint: string,
    method = 'GET',
    request: Record<string, any> | null = null
  ): Promise<IRequestResponse> {
    // Construct complete request.
    let fullRequest: RequestInit;
    if (request === null) {
      fullRequest = {
        method: method
      };
    } else {
      fullRequest = {
        method: method,
        body: JSON.stringify(request)
      };
    }

    // Retrieve server connection settings.
    const settings = ServerConnection.makeSettings();

    // Specify URL for communicating with the mosaik_docker_jl backend.
    const requestUrl = URLExt.join(
      settings.baseUrl,
      'mosaik_docker_jl', // API Namespace
      endPoint
    );

    // Send request to server.
    let response: Response;
    try {
      response = await ServerConnection.makeRequest(
        requestUrl,
        fullRequest,
        settings
      );
    } catch (error) {
      return Promise.reject(new ServerConnection.NetworkError(TypeError(String(error))));
    }

    // Retrieve low-level API response.
    let data: IRequestResponse;
    try {
      data = await response.json();
    } catch (error) {
      return Promise.reject({ error, response });
    }

    if (!response.ok) {
      return Promise.reject(new ServerConnection.ResponseError(response));
    }

    return Promise.resolve(data);
  }

  /**
   * Execute Python code on the server (via a dedicated Python kernel).
   * In the Python code, an instance of class CallbackComm (imported from
   * mosaik_docker_jl.comm) named 'comm' is available, which can be used
   * to send back data and trigger the execution of the callback functions
   * 'onMsg' and 'onClose'.
   *
   * @param commTargetPrefix - prefix used for the kernel comm target
   * @param executeCode - Python code to be executed
   * @param onMsg - data from the kernel can be sent back to the frontend asynchronously via this callback function
   * @param onClose - this callback function is executed when the kernel closes
   * @returns execution status
   */
  export async function executeWithCallbacks(
    commTargetPrefix: string,
    executeCode: string,
    onMsg: (msg: KernelMessage.ICommMsgMsg) => void | PromiseLike<void>,
    onClose: (msg: KernelMessage.ICommCloseMsg) => void | PromiseLike<void>
  ): Promise<IExecuteResponse> {
    const commTarget = commTargetPrefix + UUID.uuid4();

    // Start a python kernel
    const kernelManager = new KernelManager();
    const kernel = await kernelManager.startNew({ name: 'python' });

    // Register a new comm target and set the callbacks.
    kernel.registerCommTarget(commTarget, (comm, commMsg) => {
      if (commMsg.content.target_name !== commTarget) {
        return;
      }
      comm.onMsg = onMsg;
      comm.onClose = onClose;
    });

    // Add boilerplate code for initializing the callback interface (comm).
    const code =
      'from mosaik_docker_jl.comm import CallbackComm\n' +
      `comm = CallbackComm( '${commTarget}' )\n` +
      executeCode;

    // Execute the code on the kernel.
    const reply: KernelMessage.IExecuteReplyMsg = await kernel.requestExecute({
      code: code
    }).done;
    const status = await reply.content.status;

    // The kernel is no longer needed, try to shut it down.
    try {
      await kernel.shutdown();
    } catch (error) {
      return Promise.reject({ status: 'kernel-error', error: error });
    }

    if (status === 'error') {
      const errorMessage = reply.content as KernelMessage.IReplyErrorContent;
      return Promise.reject({ status: status, error: errorMessage.evalue });
    }

    return Promise.resolve({ status: status });
  }
}

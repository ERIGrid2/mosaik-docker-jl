import {
  URLExt
} from '@jupyterlab/coreutils';

import {
  KernelManager,
  KernelMessage,
  ServerConnection
} from '@jupyterlab/services';

import {
  //PromiseDelegate,
  UUID
} from '@lumino/coreutils';

import {
  MosaikDockerSim
} from './tokens'


/**
 * Send a request to the server.
 * The request will be parsed there and the appropriate mosaik-docker API will be called (blocking).
 * The results from this API call are then returned (asynchronously).
 */
export async function sendRequest(
  endPoint: string,
  method: string = 'GET',
  request: Object = null
): Promise<MosaikDockerSim.APIResponse> {

  let fullRequest: RequestInit;

  if ( request === null ) {
    fullRequest = {
      method: method
    };
  } else {
    fullRequest = {
      method: method,
      body: JSON.stringify( request )
    };
  }

  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();

  const requestUrl = URLExt.join(
    settings.baseUrl,
    'mosaik_docker_jl', // API Namespace
    endPoint
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(
      requestUrl, fullRequest, settings
    );
  } catch ( error ) {
    return Promise.reject(
      new ServerConnection.NetworkError( error )
    );
  }

  let data: MosaikDockerSim.APIResponse;
  try {
    data = await response.json();
  } catch ( error ) {
    return Promise.reject( { error, response } );
  }

  if ( !response.ok ) {
    return Promise.reject(
      new ServerConnection.ResponseError( response )
    );
  }

  return Promise.resolve( data );
}


export async function executeWithCallbacks(
  commTargetPrefix: string,
  executeCode: string,
  onMsg: ( msg: KernelMessage.ICommMsgMsg ) => void | PromiseLike<void>,
  onClose: ( msg: KernelMessage.ICommCloseMsg ) => void | PromiseLike<void>
): Promise<MosaikDockerSim.ExecuteResponse> {

  const commTarget = commTargetPrefix + UUID.uuid4()

  // Start a python kernel
  const kernelManager = new KernelManager();
  const kernel = await kernelManager.startNew( { name: 'python' } );

  kernel.registerCommTarget( commTarget, ( comm, commMsg ) => {
      if ( commMsg.content.target_name !== commTarget ) { return; }
      comm.onMsg = onMsg;
      comm.onClose = onClose;
    }
  );

  const code = `from mosaik_docker_jl.comm import CallbackComm\n` +
    `comm = CallbackComm( '${ commTarget }' )\n` +
    executeCode;

  const reply: KernelMessage.IExecuteReplyMsg = await kernel.requestExecute( { code: code } ).done;
  const status = await reply.content.status;

  try {
    await kernel.shutdown();
  } catch ( error ) {
    return Promise.reject( { status: 'kernel-error', error: error } );
  }

  if ( status === 'error' ) {
    const errorMessage = reply.content as KernelMessage.IReplyErrorContent;
    return Promise.reject( { status: status, error: errorMessage.evalue } );
  }

  return Promise.resolve( { status: status } );
}



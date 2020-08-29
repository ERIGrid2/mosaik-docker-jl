'''
Module for executing commands, sending results back to the handlers
'''
import os
from ._version import __version__

from mosaik_docker.cli.create_sim_setup import create_sim_setup as md_create_sim_setup
from mosaik_docker.cli.get_sim_setup_root import get_sim_setup_root as md_get_sim_setup_root
from mosaik_docker.cli.configure_sim_setup import configure_sim_setup as md_configure_sim_setup
from mosaik_docker.cli.check_sim_setup import check_sim_setup as md_check_sim_setup
from mosaik_docker.cli.delete_sim_setup import delete_sim_setup as md_delete_sim_setup
from mosaik_docker.cli.start_sim import start_sim as md_start_sim
from mosaik_docker.cli.cancel_sim import cancel_sim as md_cancel_sim
from mosaik_docker.cli.clear_sim import clear_sim as md_clear_sim
from mosaik_docker.cli.get_sim_status import get_sim_status as md_get_sim_status
from mosaik_docker.cli.get_sim_results import get_sim_results as md_get_sim_results
from mosaik_docker.cli.get_sim_ids import get_sim_ids as md_get_sim_ids


class Execute:
    '''
    A single class to execute commands on the backend.
    '''

    def __init__( self, contents_manager ):
        self.contents_manager = contents_manager
        self.root_dir = os.path.expanduser( contents_manager.root_dir )


    def version( self ):
        '''
        :return: the version of this extension
        '''
        response = { 'code': 0, 'message': __version__ }
        return response


    def get_user_home_dir( self ):
        '''
        :return: the user's home directory
        '''
        response = { 'code': 0, 'message': os.getcwd() }
        return response


    def get_sim_setup_root( self, dir ):
        '''
        Check if the specified directory (or any parent directory) contains a simulation setup configuration.

        :param dir: directory path to check (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            sim_setup_root = md_get_sim_setup_root( dir )

            if True == sim_setup_root['valid']:
                response[ 'code' ] = 0
                response[ 'message' ] = sim_setup_root['dir']
            else:
                response[ 'code' ] = 1
                response[ 'error' ] = 'not part of a simulation setup: {}'.format( dir )

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def create_sim_setup( self, name, dir ):
        '''
        Create an empty mosaik-docker simulation setup in a new directory.

        :param name: name of the simulation setup (string)
        :param dir: directory to put the generated simulation setup (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            sim_setup_dir = md_create_sim_setup( name, dir )

            response[ 'code' ] = 0
            response[ 'message' ] = 'created new simulation setup: {}'.format( sim_setup_dir )

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def configure_sim_setup( self, dir, docker_file, scenario_file, extra_files, extra_dirs, results ):
        '''
        Configure an existing mosaik-docker simulation setup.

        :param setup_dir: directory of the simulation setup (string, default: '.')
        :param docker_file: name of the Dockerfile used for building the simulation orchestrator image (string)
        :param scenario_file: name of the mosaik scenario file (string)
        :param extra_files: additional files to be added to the simulation orchestrator image (list of strings)
        :param extra_dirs: additional directories to be added to the simulation orchestrator image (list of strings)
        :param results: list of paths of result files or folders, i.e., files or folders produced by the simulation that should be retrieved after the simulation has finished (list of strings)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            sim_config_path = md_configure_sim_setup( dir, docker_file, scenario_file, extra_files, extra_dirs, results )

            response[ 'code' ] = 0
            response[ 'message' ] = 'updated simulation configuration: {}'.format( sim_config_path )

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def check_sim_setup( self, dir ):
        '''
        Check an existing mosaik-docker simulation setup.

        :param dir: directory of the simulation setup (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            check = md_check_sim_setup( dir )
            response[ 'code' ] = 0 if check[ 'valid' ] else 1
            response[ 'message' ] = check[ 'status' ]

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def delete_sim_setup( self, dir ):
        '''
        Delete a simulation setup, including all associated Docker images and containers.

        :param dir: directory of the simulation setup (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            delete = md_delete_sim_setup( dir )
            response[ 'code' ] = 0 if delete[ 'valid' ] else 1
            response[ 'message' ] = delete[ 'status' ]

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def start_sim( self, dir ):
        '''
        Start a new mosaik-docker simulation.

        :param dir: path to simulation setup (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            sim_id = md_start_sim( dir )

            response[ 'code' ] = 0
            response[ 'message' ] = 'started new simulation with ID = {}'.format( sim_id )

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def cancel_sim( self, dir, id ):
        '''
        Cancel a mosaik-docker simulation.

        :param dir: path to simulation setup (string)
        :param id: ID of simulation to be cancelled (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            sim_id = md_cancel_sim( dir, id )

            response[ 'code' ] = 0
            response[ 'message' ] = 'cancelled simulation with ID = {}'.format( sim_id )

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def clear_sim( self, dir, id ):
        '''
        Clear a mosaik-docker simulation.

        :param dir: path to simulation setup (string)
        :param id: ID of simulation to be cleared (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            sim_id = md_clear_sim( dir, id )

            response[ 'code' ] = 0
            response[ 'message' ] = 'cleared simulation with ID = {}'.format( sim_id )

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def get_sim_status( self, dir ):
        '''
        Get status of all simulations of a mosaik-docker setup.

        :param dir: path to simulation setup (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            status = md_get_sim_status( dir )

            response[ 'code' ] = 0
            response[ 'message' ] = status

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def get_sim_results( self, dir, id ):
        '''
        Get status of all simulations of a mosaik-docker setup.

        :param dir: path to simulation setup (string)
        :param id: ID of simulation for which results shoud be retrieved (string)
        :return: response with status code and error message.
        '''

        response = {}

        try:
            sim_id = md_get_sim_results( dir, id )

            response[ 'code' ] = 0
            response[ 'message' ] = 'retrieved results from simulation with ID = {}'.format( sim_id )

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response


    def get_sim_ids( self, dir ):
        '''
        Get IDs all running (status 'UP') and finished (status 'DOWN') simulations of a mosaik-docker simulation setup.

        :param dir: path to simulation setup (string)
        :return: response with status code and list of IDs.
        '''

        response = {}

        try:
            sim_ids = md_get_sim_ids( dir )

            response[ 'code' ] = 0
            response[ 'message' ] = sim_ids

        except Exception as err:

            response[ 'code' ] = 2
            response[ 'error' ] = str( err )

        return response

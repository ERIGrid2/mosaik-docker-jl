from ._module_name import __module_name__

import json

from notebook.base.handlers import APIHandler
from notebook.utils import url_path_join as ujoin

import tornado


class ExeHandler( APIHandler ):
    '''
    Top-level parent class for execution handlers.
    '''

    @property
    def exe( self ):
        return self.settings['exe']


class VersionHandler( ExeHandler ):

    @tornado.web.authenticated
    def get( self ):
        '''
        Handler for `version` command.
        '''
        response = self.exe.version()
        self.finish( json.dumps( response ) )


class GetUserHomeDirHandler( ExeHandler ):

    @tornado.web.authenticated
    def get( self ):
        '''
        Handler for `get_user_home_dir` command.
        '''
        response = self.exe.get_user_home_dir()
        self.finish( json.dumps( response ) )


class GetSimSetupRootHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `get_sim_setup_root` command

        Input format:
            {
              'dir': 'directory path to check'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'

        # Execute `get_sim_setup_root` command and retrieve response.
        response = self.exe.get_sim_setup_root( dir )

        # Return response.
        self.finish( json.dumps( response ) )


class CreateSimSetupHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `create_sim_setup` command

        Input format:
            {
              'name': 'name of the simulation setup'
              'dir': 'directory to put the generated simulation setup'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        name = data['name']
        dir = data['dir'] if data['dir'] else '.'

        # Execute `create_sim_setup` command and retrieve response.
        response = self.exe.create_sim_setup( name, dir )

        # Return response.
        self.finish( json.dumps( response ) )


class ConfigureSimSetupHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `configure_sim_setup` command

        Input format:
            {
              'dir': 'directory of the simulation setup'
              'docker_file': 'name of the Dockerfile used for building the simulation orchestrator image (string)'
              'scenario_file': 'name of the mosaik scenario file (string)'
              'extra_files': additional files to be added to the simulation orchestrator image (list of strings)
              'extra_dirs': additional directories to be added to the simulation orchestrator image (list of strings)
              'results': list of paths of result files or folders, i.e., files or folders produced by the simulation that should be retrieved after the simulation has finished (list of strings)
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'
        scenario_file = data['scenarioFile'].strip()
        docker_file = data['dockerFile'].strip()
        extra_files = [ f.strip() for f in data['extraFiles'] ]
        extra_dirs = [ d.strip() for d in data['extraDirs'] ]
        results = [ r.strip() for r in data['results'] ]

        # Execute `configure_sim_setup` command and retrieve response.
        response = self.exe.configure_sim_setup( dir, docker_file, scenario_file, extra_files, extra_dirs, results )

        # Return response.
        self.finish( json.dumps( response ) )


class CheckSimSetupHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `check_sim_setup` command

        Input format:
            {
              'dir': 'directory of the simulation setup'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'

        # Execute `check_sim_setup` command and retrieve response.
        response = self.exe.check_sim_setup( dir )

        # Return response.
        self.finish( json.dumps( response ) )


class DeleteSimSetupHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `delete_sim_setup` command

        Input format:
            {
              'dir': 'directory of the simulation setup'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'

        # Execute `check_sim_setup` command and retrieve response.
        response = self.exe.delete_sim_setup( dir )

        # Return response.
        self.finish( json.dumps( response ) )


class StartSimHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `start_sim` command

        Input format:
            {
              'dir': 'directory of the simulation setup'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'

        # Execute `start_sim` command and retrieve response.
        response = self.exe.start_sim( dir )

        # Return response.
        self.finish( json.dumps( response ) )


class CancelSimHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `cancel_sim` command

        Input format:
            {
              'dir': 'directory of the simulation setup',
              'id': 'ID of simulation to be cancelled'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'
        id = data['id']

        # Execute `cancel_sim` command and retrieve response.
        response = self.exe.cancel_sim( dir, id )

        # Return response.
        self.finish( json.dumps( response ) )


class ClearSimHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `clear_sim` command

        Input format:
            {
              'dir': 'directory of the simulation setup',
              'id': 'ID of simulation to be cleared'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'
        id = data['id']

        # Execute `clear_sim` command and retrieve response.
        response = self.exe.clear_sim( dir, id )

        # Return response.
        self.finish( json.dumps( response ) )


class GetSimStatusHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `get_sim_status` command

        Input format:
            {
              'dir': 'directory of the simulation setup'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'

        # Execute `get_sim_status` command and retrieve response.
        response = self.exe.get_sim_status( dir )

        # Return response.
        self.finish( json.dumps( response ) )


class GetSimResultsHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `get_sim_results` command

        Input format:
            {
              'dir': 'directory of the simulation setup',
              'id': 'ID of simulation for which results shoud be retrieved'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'
        id = data['id']

        # Execute `get_sim_results` command and retrieve response.
        response = self.exe.get_sim_results( dir, id )

        # Return response.
        self.finish( json.dumps( response ) )


class GetSimIdsHandler( ExeHandler ):

    @tornado.web.authenticated
    def post( self ):
        '''
        Handler for `get_sim_ids` command

        Input format:
            {
              'dir': 'directory of the simulation setup'
            }
        '''
        # Retrieve data.
        data = json.loads( self.request.body.decode( 'utf-8' ) )
        dir = data['dir'] if data['dir'] else '.'

        # Execute `get_sim_ids` command and retrieve response.
        response = self.exe.get_sim_ids( dir )

        # Return response.
        self.finish( json.dumps( response ) )


def setup_handlers( web_app ):
    '''
    Add handlers for plug-in back-end to main application.
    '''

    # Associate paths to handlers.
    handlers = [
        ( 'version', VersionHandler ),
        ( 'get_user_home_dir', GetUserHomeDirHandler ),
        ( 'get_sim_setup_root', GetSimSetupRootHandler ),
        ( 'create_sim_setup', CreateSimSetupHandler ),
        ( 'configure_sim_setup', ConfigureSimSetupHandler ),
        ( 'check_sim_setup', CheckSimSetupHandler ),
        ( 'delete_sim_setup', DeleteSimSetupHandler ),
        ( 'start_sim', StartSimHandler ),
        ( 'cancel_sim', CancelSimHandler ),
        ( 'clear_sim', ClearSimHandler ),
        ( 'get_sim_status', GetSimStatusHandler ),
        ( 'get_sim_results', GetSimResultsHandler ),
        ( 'get_sim_ids', GetSimIdsHandler ),
    ]

    # Retrieve the base URL.
    base_url = web_app.settings['base_url']

    # Add the base URL to the paths.
    handlers = [ ( ujoin( base_url, __module_name__, x[0] ), x[1] ) for x in handlers ]

    # Add handlers to main app.
    web_app.add_handlers( '.*', handlers )

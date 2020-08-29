from ._version import __version__ 
from ._module_name import __module_name__ 

from .handlers import setup_handlers
from .execute import Execute


def _jupyter_server_extension_paths():
    return [ {
        'module': __module_name__ 
    } ]


def load_jupyter_server_extension( lab_app ):
    '''
    Registers the API handler to receive HTTP requests from the frontend extension.

    :param lab_app: JupyterLab application instance (jupyterlab.labapp.LabApp)
    '''
    
    exe = Execute( lab_app.web_app.settings[ 'contents_manager' ] )
    lab_app.web_app.settings[ 'exe' ] = exe

    setup_handlers( lab_app.web_app )
    lab_app.log.info( 'Registered {0} extension at URL path /{0}'.format( __module_name__ ) )

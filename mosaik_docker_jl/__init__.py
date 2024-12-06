from ._module_name import __module_name__
try:
    from ._version import __version__
except ImportError:
    # Fallback when using the package in dev mode without installing
    # in editable mode with pip. It is highly recommended to install
    # the package from a stable release or in editable mode: https://pip.pypa.io/en/stable/topics/local-project-installs/#editable-installs
    import warnings
    warnings.warn(f'Importing {__module_name__} outside a proper installation.')
    __version__ = 'dev'

from .handlers import setup_handlers
from .execute import Execute


def _jupyter_labextension_paths():
    return [{
        'src': 'labextension',
        'dest': __module_name__
    }]


def _jupyter_server_extension_points():
    return [{
        'module': __module_name__
    }]


def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.

    Parameters
    ----------
    server_app: jupyterlab.labapp.LabApp
        JupyterLab application instance
    """
    exe = Execute( server_app.web_app.settings[ 'contents_manager' ] )
    server_app.web_app.settings[ 'exe' ] = exe

    # server_app.web_app.settings[ 'log' ] = server_app.log

    setup_handlers(server_app.web_app)
    server_app.log.info(f'Registered {__module_name__} (version {__version__}) server extension')

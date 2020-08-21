'''
Setup Module to setup Python Handlers for the mosaik-docker-jl extension.
'''
import os

from jupyter_packaging import (
    create_cmdclass, install_npm, ensure_targets,
    combine_commands, ensure_python, get_version,
)
import setuptools

HERE = os.path.abspath( os.path.dirname( __file__ ) )

# The name of the project
name = 'mosaik_docker_jl'

# Ensure a valid python version
ensure_python( '>=3.5' )

# Get our version
version = get_version( os.path.join( name, '_version.py' ) )

lab_path = os.path.join( HERE, name, 'labextension' )

# Representative files that should exist after a successful build
jstargets = [
    os.path.join( HERE, 'lib', 'mosaik-docker-jl.js' ),
]

package_data_spec = {
    name: [
        '*'
    ]
}

data_files_spec = [
    ( 'share/jupyter/lab/extensions', lab_path, '*.tgz' ),
    ( 'etc/jupyter/jupyter_notebook_config.d', 'jupyter-config', 'mosaik_docker_jl.json' ),
]

cmdclass = create_cmdclass( 'jsdeps', 
    package_data_spec = package_data_spec,
    data_files_spec = data_files_spec
)

cmdclass[ 'jsdeps' ] = combine_commands(
    install_npm( HERE, build_cmd = 'build:all', npm = ['jlpm'] ),
    ensure_targets( jstargets ),
)

with open( 'README.md', 'r' ) as fh:
    long_description = fh.read()

setup_args = dict(
    name = name,
    version = version,
    url = 'https://github.com/ERIGrid2/mosaik-docker-jl',
    author = 'Edmund Widl',
    description = 'A JupyterLab extension for executing co-simulations based on the mosaik framework and Docker.',
    long_description = long_description,
    long_description_content_type = 'text/markdown',
    cmdclass = cmdclass,
    packages = setuptools.find_packages(),
    install_requires = [
        'jupyterlab>=2.0',
        'ipykernel',
    ],
    zip_safe = False,
    include_package_data = True,
    license = 'BSD-3-Clause',
    platforms = 'Linux, Mac OS X, Windows',
    keywords = ['Jupyter', 'JupyterLab', 'mosaik', 'mosaik-docker'],
    classifiers = [
        'Programming Language :: Python :: 3',
        'Framework :: Jupyter',
    ],
)


if __name__ == '__main__':
    setuptools.setup( **setup_args )

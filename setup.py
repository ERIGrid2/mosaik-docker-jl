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
name = 'mosaik-docker-jl'
pkg_name = 'mosaik_docker_jl'

# Ensure a valid python version
ensure_python( '>=3.5' )

# Get our version
version = get_version( os.path.join( pkg_name, '_version.py' ) )


lab_path = os.path.join( HERE, pkg_name, 'labextension' )


package_data_spec = {
    pkg_name: [
        '*'
    ]
}

data_files_spec = [
    ( 'share/jupyter/lab/extensions', lab_path, '*.tgz' ),
    ( 'etc/jupyter/jupyter_notebook_config.d', 'jupyter-config', 'mosaik_docker_jl.json' ),
]

if ( os.path.isfile( os.path.join( HERE, 'package.json' ) ) ):
    # Representative files that should exist after a successful build
    jstargets = [
        os.path.join( HERE, 'lib', 'mosaik-docker-jl.js' ),
    ]

    cmdclass = create_cmdclass(
        'jsdeps', 
        package_data_spec = package_data_spec,
        data_files_spec = data_files_spec
    )

    cmdclass[ 'jsdeps' ] = combine_commands(
        install_npm( HERE, build_cmd = 'build:all', npm = ['jlpm'] ),
        ensure_targets( jstargets ),
    )
else:
    cmdclass = create_cmdclass(
        package_data_spec = package_data_spec,
        data_files_spec = data_files_spec
    )

cmdclass.pop('develop')


# Read long description from file (reStructuredText syntax). Will be parsed and displayed as HTML online.
with open( 'description.rst' ) as description_file:
    long_description = description_file.read()

setup_args = dict(
    name = name,
    version = version,
    maintainer = 'ERIGrid 2.0 development team',
    maintainer_email = 'edmund.widl@ait.ac.at',
    url = 'https://mosaik-docker.readthedocs.io/projects/jupyter/',
    description = 'A JupyterLab extension for executing co-simulations based on the mosaik framework and Docker.',
    long_description = long_description,
    cmdclass = cmdclass,
    packages = setuptools.find_packages(),
    install_requires = [
        'jupyterlab>=2.0',
        'ipykernel',
        'mosaik-docker>=0.1.1'
    ],
    zip_safe = False,
    include_package_data = True,
    license = 'BSD-3-Clause',
    platforms = [ 'any' ],
    keywords = ['Jupyter', 'JupyterLab', 'mosaik', 'mosaik-docker'],
    classifiers = [
        'Programming Language :: Python :: 3',
        'Framework :: Jupyter',
    ],
)


if __name__ == '__main__':
    setuptools.setup( **setup_args )

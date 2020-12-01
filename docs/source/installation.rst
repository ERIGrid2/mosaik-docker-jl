*************************************************
Installing the mosaik-docker JupyterLab extension
*************************************************

Requirements
============

You will need `Python <https://python.org>`_ (tested with version >= 3.6) and `NodeJS <https://nodejs.org/en/>`_ to install the extension.
For the extension to work properly, you will also need a working installation of `Docker Engine <https://docs.docker.com/engine/install/>`_.

Installation (standalone)
=========================

The package is available via the official `Python Package Index <https://pypi.org/project/mosaik-docker-jl/>`_.
Install it from the command line:

.. code-block:: bash

    pip install mosaik-docker-jl
    jupyter lab build


Installation (JupyterHub)
=========================

JupyterHub distributions (e.g., `The Littlest JupyterHub <https://tljh.jupyter.org/>`_) already come with NodeJS installed.
However, `Docker Engine <https://docs.docker.com/engine/install/>`_ still needs to be installed from the `JupyterHub administrator terminal <https://tljh.jupyter.org/en/latest/howto/env/user-environment.html#installing-apt-packages>`_ using the ``sudo -E``.
From there, also the extension needs to be installed:

.. code-block:: bash

    sudo -E pip install mosaik-docker-jl
    sudo -E jupyter lab build

Each new JupyterHub user also has to be explicitly added to the group ``docker``:

.. code-block:: bash

    tljh-config add-item users.extra_user_groups.docker <user-name>


Troubleshoot
============

If you are seeing the frontend extension but it is not working, check that the server extension is enabled:

.. code-block:: bash

    jupyter serverextension list

If the server extension is installed and enabled but you are not seeing the frontend, check the frontend is installed:

.. code-block:: bash

    jupyter labextension list

If it is installed, try:

.. code-block:: bash

    jupyter lab clean
    jupyter lab build

In case you get error messages similar to the following one:

..
	Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.40/containers/json: dial unix /var/run/docker.sock: connect: permission denied

Check if the user has been `added to group <https://docs.docker.com/engine/install/linux-postinstall/>`_ ``docker``.

Development
===========

Install
-------

The ``jlpm`` command is JupyterLab's pinned version of `yarn <https://yarnpkg.com/>`_ that is installed with JupyterLab.
You may use ``yarn`` or ``npm`` in lieu of ``jlpm`` below.

.. code-block:: bash

    # Clone the repo to your local environment
    git clone https://github.com/ERIGrid2/mosaik-docker-jl.git
    cd mosaik-docker-jl
    
    # Install server extension
    pip install -e .
    # Register server extension
    jupyter serverextension enable --py mosaik_docker_jl
    
    # Install dependencies
    jlpm
    # Build Typescript source
    jlpm build
    # Link your development version of the extension with JupyterLab
    jupyter labextension link .
    # Rebuild Typescript source after making changes
    jlpm build
    # Rebuild JupyterLab after making any changes
    jupyter lab build

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

.. code-block:: bash

    # Watch the source directory in another terminal tab
    jlpm watch
    # Run jupyterlab in watch mode in one terminal tab
    jupyter lab --watch

Uninstall
---------

.. code-block:: bash

    pip uninstall mosaik-docker-jl
    jupyter labextension uninstall mosaik-docker-jl
	jupyter lab build

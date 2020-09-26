Requirements
============

* JupyterLab >= 2.0

Install
=======

**Note**: You will need NodeJS to install the extension.

.. code-block:: bash

    pip install mosaik-docker-jl
    jupyter lab build

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

    pip uninstall mosaik_docker_jl
    jupyter labextension uninstall mosaik-docker-jl

from setuptools import setup

setup(name='backend',
        version='0.1',
        description='',
        url='',
        author='',
        author_email='',
        license='',
        packages=['backend', 'utils'],
        zip_safe=False,
        entry_points={
            'console_scripts': [
                'webserver=backend.app:start',
                ],
            },
        install_requires=[
            'Flask==1.1.1',
            'Flask-RESTful==0.3.8',
            'Flask-SQLAlchemy==2.4.1',
            'psycopg2-binary==2.8.4',
            'SQLAlchemy==1.3.15',
            'waitress==2.1.1',
            ],
        extras_require={
            'dev':
            ['shiv==0.1.2']
            })

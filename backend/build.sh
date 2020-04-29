#!/bin/bash
shiv -e backend.app:start -o webserver -E --compile-pyc .

#!/bin/bash

# stop at first error
set -e

# stop at uninitialized
set -u

sam build && sam deploy
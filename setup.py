#!/usr/bin/env python3
from setuptools import setup, find_packages

setup(
    name="bolt-upsc",
    version="3.10.0",
    description="BOLT - UPSC Civil Services Preparation & AI Mentorship Engine",
    author="BOLT UPSC Academic Intelligence",
    packages=find_packages(),
    python_requires=">=3.8",
    entry_points={
        "console_scripts": [
            "bolt=python.bolt_cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.10",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Education",
    ],
)

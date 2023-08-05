#!/bin/bash
arg=$1
arg2=$2
if [ ! -n "$1" ]; then
	arg="dev"
fi
if [ ! -n "$2" ]; then
	arg2="azure-infrastructure-from-template"
fi
if [ ! -d $arg2 ]; then
	mkdir $arg2 && $arg2
	pulumi new https://github.com/dev9815/pulumiAzureTemplateThesis.git --stack $arg
	sed -i 's/\r//g' destroyInfrastructure.sh
	sed -i 's/\r//g' createInfrastructure.sh && . ./createInfrastructure.sh $arg
else
	echo "Delete azure-infrastructure-from-template folder and run again this script"
fi

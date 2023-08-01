#!/bin/bash
arg=$1
if [ ! -d "./azure-infrastructure-from-template" ]; then
	mkdir azure-infrastructure-from-template && cd azure-infrastructure-from-template
	if [ ! -n "$1" ]; then
		arg="dev"
	fi
	pulumi new https://github.com/dev9815/pulumiAzureTemplateThesis.git --stack $arg
	sed -i 's/\r//g' destroyInfrastructure.sh
	sed -i 's/\r//g' createInfrastructure.sh && . ./createInfrastructure.sh $arg
else
	echo "Delete azure-infrastructure-from-template folder and run again this script"
fi

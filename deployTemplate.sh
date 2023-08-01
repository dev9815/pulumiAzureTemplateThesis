#!/bin/bash
if [ ! -d "./azure-infrastructure-from-template" ]; then
	mkdir azure-infrastructure-from-template && cd azure-infrastructure-from-template
	pulumi new https://github.com/dev9815/pulumiAzureTemplateThesis.git
	sed -i 's/\r//g' destroyInfrastructure.sh
	sed -i 's/\r//g' createInfrastructure.sh && . ./createInfrastructure.sh
else
	echo "Delete azure-infrastructure-from-template folder and run again this script"
fi

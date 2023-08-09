#!/bin/bash
arg=$1
if [ ! -n "$1" ]; then
    echo "You must provide the name of the stack to operate on"
else
	stacks=($arg "async-resources")
	branches=("master" "stopDbBranch")
	functionsName=("startDB" "stopDB")
	length=${#branches[@]}
	if [ ! -d "./${functionsName[0]}" ] || [ ! -d "./${functionsName[1]}" ] ; then
		for ((i = 0;i < length; i++ )); do
		echo "Creating ${functionsName[$i]} azure function ..."
		func init "${functionsName[$i]}" --worker-runtime node --language javascript
		cd "${functionsName[$i]}"
		echo "Installing @azure/arm-postgresql-flexible and @azure/identity SDKs ..."
		npm install --save @azure/arm-postgresql-flexible
		npm install --save @azure/identity	
		cd ..
		done
		cp -r modules/startDB "${functionsName[0]}/"
		cp -r modules/stopDB "${functionsName[1]}/"
		echo "Azure functions ${functionsName[0]} and ${functionsName[1]} have been created successfully"
	fi
	if [ ! -e "./Pulumi.async-resources.yaml" ] ; then
		find . -maxdepth 1 -type f -name "Pulumi.*.yaml" -exec bash -c 'cp {} Pulumi.async-resources.yaml; cp {} Pulumi.import-resources.yaml' \;
		pulumi stack init "${stacks[1]}"
		pulumi stack init import-resources
	fi
	
	for stack in "${stacks[@]}"
	do
	   echo "Deploying Stack : $stack"
	   pulumi stack select $stack
	   pulumi up --yes
	done
fi

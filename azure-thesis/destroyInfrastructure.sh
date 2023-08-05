#!/bin/bash
if [ -e "./Pulumi.async-resources.yaml" ] ; then	
    arg=$1
    if [ ! -n "$1" ]; then
		echo "You must provide the name of the stack to operate on"
    else
		jsonFiles=("sync-resources.json" "async-resources.json")
		length=${#jsonFiles[@]}
		stacks=($arg "async-resources")
		for ((i = 0;i < length; i++ )); 
		do
			echo "Destroying Stack : ${stacks[$i]}"
			pulumi stack select "${stacks[$i]}"
			pulumi destroy --yes
			rm -f ./"${jsonFiles[$i]}"
		done		
		
	fi
else
    echo "Cannot perform destroying. Stacks could not exist yet"
fi

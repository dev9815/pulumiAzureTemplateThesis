#!/bin/bash
if [ -e "./Pulumi.async-resources.yaml" ] ; then
    arg=$1
    if [ ! -n "$1" ]; then
    	arg="dev"
    fi
    stacks=($arg "async-resources")
    for stack in "${stacks[@]}"
    do
	echo "Destroying Stack : $stack"
	pulumi stack select $stack
	pulumi destroy --yes
	pulumi stack rm --stack $stack --yes
    done
else
    echo "Cannot perform destroying. One stack between ${stacks[0]} and ${stacks[1]} could not exist yet"
fi

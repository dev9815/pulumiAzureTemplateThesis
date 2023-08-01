#!/bin/bash
stacks=("sync-resources" "async-resources")
if [ -e "./Pulumi.sync-resources.yaml" ] && [ -e "./Pulumi.async-resources.yaml" ] ; then
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

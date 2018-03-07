# curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
# -X POST \
# -H 'Accept: application/json' \
# -H 'Content-Type: application/json' \
# -d '{
#      "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:obdev/pdm_backend_flowz:dev","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3038:3038/tcp"],"version": "0","environment": {"RDB_HOST": "'"$RDB_HOST"'","RDB_PORT": "'"$RDB_PORT"'","esUrl": "'"$ESURL"'","secret": "'"$SECRET"'","auth_url": "'"$AUTH_URL"'","pwd": "'"$PWD"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3038,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
# 'http://rancher.flowz.com:8080/v2-beta/projects/1a29/services/1s514?action=upgrade'
#


if [ "$TRAVIS_BRANCH" = "master" ]
then
    {
    echo "call $TRAVIS_BRANCH branch"
    ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=Production" | jq '.data[].id' | tr -d '"'`
    echo $ENV_ID
    USERNAME="$DOCKER_USERNAME_FLOWZ";
    DOMAINKEY="$DOMAINKEY_MASTER";
    TAG="latest";
    }
elif [ "$TRAVIS_BRANCH" = "develop" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_DEVELOP";
      TAG="dev";
      }
elif [ "$TRAVIS_BRANCH" = "staging" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=Staging" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_STAGING";
      TAG="staging";
      }      
else
  {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects?name=QA" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_QA";
      TAG="qa";
   }
fi

SERVICE_ID=`curl -u ""$RANCHER_USER":"$RANCHER_PASS"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services?name=pdm-backend-flowz" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID

curl -u ""$RANCHER_USER":"$RANCHER_PASS"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/pdm_backend_flowz:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "machine=cluster-flowz"},"ports": ["3038:3038/tcp"],"environment": {"JQ_DB":"'"$JQ_DB"'","JQ_HOST":"'"$JQ_HOST"'","JQ_PORT":"'"$JQ_PORT"'","RDB_HOST": "'"$RDB_HOST"'","RDB_PORT": "'"$RDB_PORT"'","domainkey":"'"$DOMAINKEY"'","esUrl": "'"$ESURL"'","secret": "'"$SECRET"'","pwd": "'"$PWD_ENV"'","index":"'"$INDEX"'","wsport":"'"$WSPORT"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3038,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
http://rancher.flowz.com:8080/v2-beta/projects/$ENV_ID/services/$SERVICE_ID?action=upgrade

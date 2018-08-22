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
    ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_MASTER":"$RANCHER_SECRETKEY_MASTER"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_MASTER/v2-beta/projects?name=Production" | jq '.data[].id' | tr -d '"'`
    echo $ENV_ID
    USERNAME="$DOCKER_USERNAME_FLOWZ";
    DOMAINKEY="$DOMAINKEY_MASTER";
    TAG="latest";
    RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_MASTER";
    RANCHER_SECRETKEY="$RANCHER_SECRETKEY_MASTER";
    RANCHER_URL="$RANCHER_URL_MASTER";
    ES_INDEX="$ES_INDEX_MASTER";
    SERVICE_NAME="$SERVICE_NAME_MASTER";
    BACKEND_HOST="$BACKEND_HOST_MASTER";
    RDB_HOST="$RDB_HOST_MASTER";
    RDB_PORT="$RDB_PORT_MASTER";
    JQ_HOST="$JQ_HOST_MASTER";
    JQ_PORT="$JQ_PORT_MASTER";
    ESAUTH="$ESAUTH_MASTER";
    }
elif [ "$TRAVIS_BRANCH" = "develop" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_DEVELOP":"$RANCHER_SECRETKEY_DEVELOP"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_DEVELOP/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_DEVELOP";
      TAG="dev";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_DEVELOP";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_DEVELOP";
      RANCHER_URL="$RANCHER_URL_DEVELOP";
      ES_INDEX="$ES_INDEX_DEVELOP";
      SERVICE_NAME="$SERVICE_NAME_DEVELOP";
      BACKEND_HOST="$BACKEND_HOST_DEVELOP";
      RDB_HOST="$RDB_HOST_DEVELOP";
      RDB_PORT="$RDB_PORT_DEVELOP";
      JQ_HOST="$JQ_HOST_DEVELOP";
      JQ_PORT="$JQ_PORT_DEVELOP";
      ESAUTH="$ESAUTH_DEVELOP";
      }
elif [ "$TRAVIS_BRANCH" = "staging" ]
then
    {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_STAGING":"$RANCHER_SECRETKEY_STAGING"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_STAGING/v2-beta/projects?name=Staging" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_STAGING";
      TAG="staging";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_STAGING";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_STAGING";
      RANCHER_URL="$RANCHER_URL_STAGING";
      ES_INDEX="$ES_INDEX_STAGING";
      SERVICE_NAME="$SERVICE_NAME_STAGING";
      BACKEND_HOST="$BACKEND_HOST_STAGING";
      RDB_HOST="$RDB_HOST_STAGING";
      RDB_PORT="$RDB_PORT_STAGING";
      JQ_HOST="$JQ_HOST_STAGING";
      JQ_PORT="$JQ_PORT_STAGING";
      ESAUTH="$ESAUTH_STAGING";
      }      
else
  {
      echo "call $TRAVIS_BRANCH branch"
      ENV_ID=`curl -u ""$RANCHER_ACCESSKEY_QA":"$RANCHER_SECRETKEY_QA"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL_QA/v2-beta/projects?name=Develop" | jq '.data[].id' | tr -d '"'`
      echo $ENV_ID
      USERNAME="$DOCKER_USERNAME";
      DOMAINKEY="$DOMAINKEY_QA";
      TAG="qa";
      RANCHER_ACCESSKEY="$RANCHER_ACCESSKEY_QA";
      RANCHER_SECRETKEY="$RANCHER_SECRETKEY_QA";
      RANCHER_URL="$RANCHER_URL_QA";
      ES_INDEX="$ES_INDEX_QA";
      SERVICE_NAME="$SERVICE_NAME_QA";
      BACKEND_HOST="$BACKEND_HOST_QA";
      RDB_HOST="$RDB_HOST_QA";
      RDB_PORT="$RDB_PORT_QA";
      JQ_HOST="$JQ_HOST_QA";
      JQ_PORT="$JQ_PORT_QA";
      ESAUTH="$ESAUTH_QA";
   }
fi

SERVICE_ID=`curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" -X GET -H 'Accept: application/json' -H 'Content-Type: application/json' "$RANCHER_URL/v2-beta/projects/$ENV_ID/services?name=$SERVICE_NAME" | jq '.data[].id' | tr -d '"'`
echo $SERVICE_ID

curl -u ""$RANCHER_ACCESSKEY":"$RANCHER_SECRETKEY"" \
-X POST \
-H 'Accept: application/json' \
-H 'Content-Type: application/json' \
-d '{
     "inServiceStrategy":{"launchConfig": {"imageUuid":"docker:'$USERNAME'/pdm_backend_flowz:'$TAG'","kind": "container","labels":{"io.rancher.container.pull_image": "always","io.rancher.scheduler.affinity:host_label": "'"$BACKEND_HOST"'"},"ports": ["3038:3038/tcp","4038:4038/tcp"],"environment": {"JQ_DB":"'"$JQ_DB"'","JQ_HOST":"'"$JQ_HOST"'","JQ_PORT":"'"$JQ_PORT"'","RDB_HOST": "'"$RDB_HOST"'","RDB_PORT": "'"$RDB_PORT"'","domainKey":"'"$DOMAINKEY"'","esUrl": "'"$ESURL"'","secret": "'"$SECRET"'","pwd": "'"$PWD_ENV"'","index":"'"$ES_INDEX"'","wsport":"'"$WSPORT"'","ESAUTH":"'"$ESAUTH"'"},"healthCheck": {"type": "instanceHealthCheck","healthyThreshold": 2,"initializingTimeout": 60000,"interval": 2000,"name": null,"port": 3038,"recreateOnQuorumStrategyConfig": {"type": "recreateOnQuorumStrategyConfig","quorum": 1},"reinitializingTimeout": 60000,"responseTimeout": 60000,"strategy": "recreateOnQuorum","unhealthyThreshold": 3},"networkMode": "managed"}},"toServiceStrategy":null}' \
$RANCHER_URL/v2-beta/projects/$ENV_ID/services/$SERVICE_ID?action=upgrade

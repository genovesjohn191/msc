/**
 * NOTE: This job requires the presence of a Google Service Account JSON key file
 * See: https://cloud.google.com/container-registry/docs/advanced-authentication
 * This JSON key file must be uploaded as a secret called gcr-service-acct
 * that then gets mounted as a file against the jenkins build slave pod.
 * The secret should be created from a file called: service-acct-creds.json.
 * kubectl create secret generic gcr-service-acct --from-file=./service-acct-creds.json
 *
 * Also see: See https://cloud.google.com/container-registry/docs/advanced-authentication
 *
 * This job also requires an env.setup file to be injected via a configmap.
 *
 * The env.setup file should look like this:
 * export HOST='lab-portal.macquariecloudservices.com'
 * export PORT='80'
 * export API_URL='http://lab-api.macquariecloudservices.com/api'
 *
 * kubectl create configmap portal-frontend-build-env-setup --from-file=env.setup
**/

// Validate we received values for the following key parameters
if (!params.REGISTRY_LOCATION || !params.HOST_DOCKER_SOCK || !params.HOST_DOCKER_BIN || !params.HOST_KUBECTL_BIN || !params.HOST_DOCKER_GID) {
  error("You must provide all build parameters to run this job.")
}

// Set up build parameters if this job hasn't been run previously.
if (!params.REGISTRY_LOCATION) {
    echo "Setting build parameters for first run."
    properties(
        [
            disableConcurrentBuilds(),
            parameters([
                string(defaultValue: 'gcr.io/cloud-services-portal-dev', description: 'Location of the docker registry.', name: 'REGISTRY_LOCATION'),
                string(defaultValue: '/var/run/docker.sock', description: 'Location of the docker sock on the host operating system.', name: 'HOST_DOCKER_SOCK'),
                string(defaultValue: '/usr/bin/docker', description: 'Location of the docker binary on the host operating system.', name: 'HOST_DOCKER_BIN'),
                string(defaultValue: '/home/kubernetes/bin/kubectl', description: 'Location of the kubectl binary on the host operating system.', name: 'HOST_KUBECTL_BIN'),
                booleanParam(defaultValue: true, description: 'Whether to utilise the Google Container Registry as part of this build. If so searches for Google Service credentials mounted as a json file. Otherwise assumes a local insecure registry.', name: 'GOOGLE_CONTAINER_REGISTRY'),
                string(defaultValue: 'default', description: 'The namespace where kubernetes resources should be found and bound.', name: 'K8S_NAMESPACE'),
                booleanParam(name: 'DEBUG_SLEEP', defaultValue: false, description: 'Sleeps for 10 minutes at the end of a failed build for troubleshooting purposes.')
            ]),
            pipelineTriggers([])
        ]
    )
}

// Variables required for this job
def registry_location = params.REGISTRY_LOCATION
def image_name = "mcs/portal-frontend"
def build_slave_image_name = "mcs/jnlp-slave-nodejs"
def jenkins_slave_image_name = "${registry_location}/${build_slave_image_name}:latest" // NB: Image must be built manually before first jenkins run
def service_creds_location = "/etc/gcr-service-acct"
def service_creds_file = "service-acct-creds.json"
def env_setup_location = "/etc/build-config"
def env_setup_file = "env.setup"
def kube_deployment = "portal"
def slack_notify_on_success = true
def label = "buildpod"
def debug_sleep = params.DEBUG_SLEEP

echo "Building with the following configuration:"
echo "\tRegistry: ${params.REGISTRY_LOCATION}\n\tDocker Sock: ${params.HOST_DOCKER_SOCK}\n\tDocker Binary: ${params.HOST_DOCKER_BIN}\n\tKubectl Binary: ${params.HOST_KUBECTL_BIN}"
echo "and using JNLP slave container:"
echo "\t${jenkins_slave_image_name}"

// Create a Kubernetes Pod Template and run the job steps within the pod
podTemplate(
    label: label,
    containers: [
        containerTemplate(
            name: 'jnlp',
            image: jenkins_slave_image_name,
            args: '${computer.jnlpmac} ${computer.name}',
            ttyEnabled: true,
            resourceRequestMemory: '200Mi',
            resourceLimitMemory: '1.5Gi',
            alwaysPullImage: true
        )
    ],
    namespace: params.K8S_NAMESPACE,
    volumes: [
        hostPathVolume(
            hostPath: params.HOST_DOCKER_SOCK, // hook into the hosts' docker sock and mount it for use in building containers
            mountPath: '/var/run/docker.sock'
        ),
        hostPathVolume(
            hostPath: params.HOST_DOCKER_BIN, // hook into the hosts' docker bin
            mountPath: '/usr/bin/docker'
        ),
        hostPathVolume(
            hostPath: params.HOST_KUBECTL_BIN, // hook into the hosts' kubectl bin
            mountPath: '/usr/bin/kubectl'
        ),
        /* Location of the google secret - must be present even if not used */
        secretVolume(
            secretName: 'gcr-service-acct',
            mountPath: service_creds_location
        ),
        configMapVolume(
            configMapName: 'portal-frontend-build-env-setup',
            mountPath: env_setup_location
        )
    ]
) {

    node (label) {

        try {
            stage('Checkout code') {
                checkout scm
                // Retrieve git properties for use in notifications
                commitSHA = sh(
                        returnStdout: true,
                        script: 'git rev-parse HEAD'
                    ).trim()
                commitSHAShort = commitSHA.take(6)
                commitMsg = sh(
                        returnStdout: true,
                        script: "git --no-pager show HEAD --pretty=%B -q"
                    ).trim()
                commitAuthor = sh(
                        returnStdout: true,
                        script: "git --no-pager show -s --format='%an <%ae>' HEAD"
                    ).trim()
                image_version = commitSHAShort + "-" + System.currentTimeMillis()
            }

            echo "Building ${image_name} with version ${image_version}."

            stage('Run tests & build docker image') {
                sh "cp ${env_setup_location}/${env_setup_file} ."
                sh "npm install"
                sh "npm run lint"
                sh "CHROME_BIN=/usr/bin/google-chrome npm run test:prod" // Requires headless browser in the jnlp-slave container
                sh ". ./env.setup && npm run build:prod"
                sh "docker build -t ${image_name}:${image_version} ."
            }
            stage('Publish the docker image') {
                // See https://cloud.google.com/container-registry/docs/advanced-authentication
                if (params.GOOGLE_REGISTRY) {
                    echo "Authenticating to upstream docker repository."
                    sh "set +x && docker login -u _json_key -p \"\$(cat ${service_creds_location}/${service_creds_file})\" https://gcr.io"
                }
                sh "docker tag ${image_name}:${image_version} ${image_name}:latest"
                sh "docker tag ${image_name}:${image_version} ${registry_location}/${image_name}:${image_version}"
                sh "docker tag ${image_name}:${image_version} ${registry_location}/${image_name}:latest"
                sh "docker push ${registry_location}/${image_name}:${image_version}"
                sh "docker push ${registry_location}/${image_name}:latest"
            }
            stage('Deploy to k8s cluster') {
                echo "Update the deployed image"
                sh "kubectl set image deployment ${kube_deployment} ${kube_deployment}=${registry_location}/${image_name}:${image_version} --record"
                sh "kubectl rollout status deployment ${kube_deployment}"
            }
            if (slack_notify_on_success) {
                stage('Notify') {
                    slackSend (
                        color: '#00ff00', //green
                        message: "BUILD SUCCESS: <${env.BUILD_URL}console|${env.JOB_NAME} #[${env.BUILD_NUMBER}]>\n" +
                                "${commitSHAShort} ${commitAuthor}\n" +
                                "Dkr Image Version: ${image_version}\n" +
                                "> ${commitMsg}\n"
                    )
                }
            }
        }
        catch (e) {
            // If there was an exception thrown, the build failed
            currentBuild.result = "BUILD FAILED"
            slackSend (
                color: '#ff0000', //red
                message: "*BUILD FAILURE*: <${env.BUILD_URL}console|${env.JOB_NAME} #[${env.BUILD_NUMBER}]>\n" +
                        "${commitSHAShort} ${commitAuthor}:\n" +
                        "> Msg: ${commitMsg}\n" +
                        "Error:\n" +
                        "> ${e}\n" +
                        "<${env.BUILD_URL}console|Jenkins Link>"
            )
            if (debug_sleep) {
                stage('Debug failed build') {
                    echo "Sleeping 10 minutes. Try kubectl exec -it (podname) bash to see if you can figure out what went wrong."
                    sh "sleep 600"
                }
            }
        }
    }
}

pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'awoke/student-management-app'
        DOCKER_TAG   = "${BUILD_NUMBER}"
        KUBECONFIG_CRED = 'kubeconfig'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        def image = docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: "${KUBECONFIG_CRED}", variable: 'KUBECONFIG')]) {
                    sh '''
                      echo "Updating deployment image tag"
                      sed -i "s|__TAG__|${DOCKER_TAG}|g" deployment.yaml

                      kubectl apply -f deployment.yaml
                      kubectl apply -f service.yaml

                      kubectl rollout status deployment/student-management
                    '''
                }
            }
        }
    }
}

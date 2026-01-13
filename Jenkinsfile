pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'awoke/student-management-app'
        DOCKER_TAG   = "${BUILD_NUMBER}"
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
        // Optional: quick debug
        bat 'minikube status || echo "Minikube not running - start it manually first!"'

        bat '''
            minikube kubectl -- apply -f deployment.yaml
            minikube kubectl -- apply -f service.yaml
        '''

        // Update image (safer than set image if manifests use :latest)
        bat '''
            minikube kubectl -- set image deployment/student-management \
              app=%DOCKER_IMAGE%:%DOCKER_TAG%
        '''

        // Wait for rollout
        bat '''
            minikube kubectl -- rollout status deployment/student-management --timeout=120s
        '''

        // Quick verification
        bat 'minikube kubectl -- get pods'
        bat 'minikube kubectl -- get svc'
    }
}
    }
}

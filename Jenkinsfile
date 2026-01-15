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
        // Debug basics
        bat 'echo Workspace dir:'
        bat 'dir'

        bat 'echo Checking for YAML files:'
        bat 'if exist deployment.yaml (echo deployment.yaml FOUND) else (echo ERROR - deployment.yaml MISSING)'
        bat 'if exist service.yaml (echo service.yaml FOUND) else (echo ERROR - service.yaml MISSING)'

        // Use FULL PATH to minikube
        bat '''
            "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" status || echo "Minikube status failed - check if running!"
            "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" kubectl -- version --client || echo "minikube kubectl wrapper failed!"
        '''

        // Apply with full path + error capture
        bat '''
            "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" kubectl -- apply -f deployment.yaml || echo "DEPLOYMENT APPLY FAILED!"
            "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" kubectl -- apply -f service.yaml || echo "SERVICE APPLY FAILED!"
        '''

        bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" kubectl -- get pods || echo "get pods failed"'
    }
}
    }
}

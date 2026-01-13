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
        // Debug 1: Confirm minikube & kubectl wrapper work
        bat 'minikube status || echo "Minikube status failed!"'

        bat 'minikube kubectl -- version --client || echo "minikube kubectl wrapper failed!"'

        // Debug 2: List files in workspace (must see deployment.yaml & service.yaml)
        bat 'dir'

        bat 'if exist deployment.yaml (echo deployment.yaml found) else (echo ERROR: deployment.yaml MISSING!)'
        bat 'if exist service.yaml (echo service.yaml found) else (echo ERROR: service.yaml MISSING!)'

        // Debug 3: Try apply with verbose output
        bat '''
            minikube kubectl -- apply -f deployment.yaml --dry-run=client -o yaml || echo "Dry-run on deployment failed!"
            minikube kubectl -- apply -f deployment.yaml || echo "Apply deployment failed!"
            minikube kubectl -- apply -f service.yaml || echo "Apply service failed!"
        '''

        // Quick status check
        bat 'minikube kubectl -- get pods || echo "get pods failed!"'
        bat 'minikube kubectl -- get svc || echo "get svc failed!"'
    }
}
    }
}

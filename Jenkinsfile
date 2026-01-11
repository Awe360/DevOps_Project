pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'awoke/student-management-app'  // Replace with your Docker Hub repo
        DOCKER_TAG = "${env.BUILD_NUMBER}"  // Use build number as tag
        KUBE_CONFIG = credentials('kubeconfig')  // Your Kubernetes credential ID in Jenkins
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
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {  // Add your Docker Hub creds in Jenkins
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push()
                        docker.image("${DOCKER_IMAGE}:${DOCKER_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Update deployment.yaml with new image tag
                    sh "sed -i 's|image: ${DOCKER_IMAGE}:.*|image: ${DOCKER_IMAGE}:${DOCKER_TAG}|g' deployment.yaml"
                    
                    // Apply manifests using kubectl
                    withKubeConfig([credentialsId: 'kubeconfig']) {  // Your kubeconfig ID
                        sh 'kubectl apply -f deployment.yaml'
                        sh 'kubectl apply -f service.yaml'
                    }
                }
            }
        }
    }
}
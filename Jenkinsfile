pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'awoke/student-management-app'
        DOCKER_TAG   = "${env.BUILD_NUMBER}"
        // Use Minikube's kubectl wrapper – it handles config automatically
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

        // ────────────────────────────────────────────────
        //          NEW: Prepare Manifest with new tag
        // ────────────────────────────────────────────────
        stage('Update Kubernetes Manifest') {
            steps {
                powershell '''
                    $image = "${env:DOCKER_IMAGE}:v${env:BUILD_NUMBER}"
                    $file = "kubernetes/deployment.yaml"
                    
                    $content = Get-Content $file -Raw
                    $content = $content -replace 'image:\\s+awoke/student-management-app:[^\\s]+', "image: $image"
                    Set-Content $file $content
                '''
                // Optional: show what changed
                bat 'type kubernetes\\deployment.yaml'
            }
        }

        // ────────────────────────────────────────────────
        //          NEW: Deploy to Minikube
        // ────────────────────────────────────────────────
        stage('Deploy to Kubernetes (Minikube)') {
            steps {
                // Apply both files (deployment + service)
                bat '''
                    minikube kubectl -- apply -f kubernetes\\deployment.yaml
                    minikube kubectl -- apply -f kubernetes\\service.yaml
                '''

                // Quick verification
                bat '''
                    minikube kubectl -- get pods
                    minikube kubectl -- get svc
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished!'
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed - check logs'
        }
    }
}
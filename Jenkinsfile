pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'awoke/student-management-app'
        DOCKER_TAG   = "${env.BUILD_NUMBER}"
        // Optional: Use 'latest' for always-latest deploys, or BUILD_NUMBER for versioned rolls
        IMAGE_TO_DEPLOY = "${DOCKER_IMAGE}:${DOCKER_TAG}"   // or ":latest"
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
                        image.push('latest')   // optional
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                withKubeConfig([credentialsId: 'kubeconfig']) {   // ← your credential ID here!
                    script {
                        // Optional: If you want versioned deploys (recommended for rollback)
                        // Update image in deployment.yaml
                        bat "sed -i \"s|image: .*|image: ${DOCKER_IMAGE}:${DOCKER_TAG}|g\" deployment.yaml"

                        // Or for always :latest
                        // bat "sed -i \"s|image: .*|image: ${DOCKER_IMAGE}:latest|g\" deployment.yaml"

                        // Apply manifests (assumes files are in repo root)
                        bat 'kubectl apply -f deployment.yaml'
                        bat 'kubectl apply -f service.yaml'

                        // Optional: Wait for rollout + basic verification
                        bat "kubectl rollout status deployment/student-management --timeout=120s"
                        bat 'kubectl get pods -l app=student-management'
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                if (isUnix()) {
                    sh 'docker rmi ${DOCKER_IMAGE}:${DOCKER_TAG} || true'
                } else {
                    bat 'docker rmi %DOCKER_IMAGE%:%DOCKER_TAG% || exit /b 0'
                }
            }
            cleanWs()  // cleanup workspace
        }
        success {
            echo "Deployment successful! Check your app at the LoadBalancer IP (kubectl get svc student-management-service)"
        }
        failure {
            echo "Deployment failed – check logs"
        }
    }
}
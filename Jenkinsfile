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
        withKubeConfig([credentialsId: 'kubeconfig']) {
            script {
                // Update image tag using PowerShell (Windows-safe)
                bat """
powershell -Command "(Get-Content deployment.yaml) -replace 'image: .*', 'image: ${DOCKER_IMAGE}:${DOCKER_TAG}' | Set-Content deployment.yaml"
                """

                // Optional: If you prefer always :latest (uncomment and comment above)
                // bat """
                // powershell -Command "(Get-Content deployment.yaml) -replace 'image: .*', 'image: ${DOCKER_IMAGE}:latest' | Set-Content deployment.yaml"
                // """

                // Apply manifests
                bat 'kubectl apply -f deployment.yaml'
                bat 'kubectl apply -f service.yaml'

                // Wait for rollout and verify (good practice)
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
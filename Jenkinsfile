pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'awoke/student-management-app'
        DOCKER_TAG   = "${env.BUILD_NUMBER}"
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
    when {
        expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
    }
    steps {
        // No need for withKubeConfig – minikube handles auth
        script {
            // Update the image tag (your existing code works)
            def yamlContent = readFile 'deployment.yaml'
            def updatedContent = yamlContent.replaceAll('image: .*', "image: ${DOCKER_IMAGE}:${DOCKER_TAG}")
            writeFile file: 'deployment.yaml', text: updatedContent
            
            echo "Updated deployment.yaml image to: ${DOCKER_IMAGE}:${DOCKER_TAG}"

            // Ensure minikube is available, start if stopped, then apply manifests
            bat """
setlocal enableextensions enabledelayedexpansion

where minikube >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Minikube binary not found on PATH. Install minikube and ensure PATH is set for the Jenkins agent.
  exit /b 1
)

minikube status >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo Minikube not running; attempting to start...
  minikube start --driver=docker || exit /b 1
)

minikube kubectl -- apply -f deployment.yaml || exit /b 1
minikube kubectl -- apply -f service.yaml || exit /b 1
minikube kubectl -- rollout status deployment/student-management --timeout=120s || exit /b 1
minikube kubectl -- get pods -l app=student-management -o wide
minikube kubectl -- get svc student-management-service
"""
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
            cleanWs()
        }
        success {
            echo "Deployment successful! Check app at LoadBalancer IP (see console for EXTERNAL-IP)"
        }
        failure {
            echo "Deployment failed – check logs above"
        }
    }
}
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
        expression { currentBuild.currentResult == 'SUCCESS' }
    }
    steps {
        withKubeConfig([credentialsId: 'kubeconfig']) {
            script {
                def kubectl = isUnix() ? 'kubectl' : 'kubectl'

                // Apply manifests
                if (isUnix()) {
                    sh """
                      ${kubectl} apply -f deployment.yaml -n student-management
                      ${kubectl} apply -f service.yaml -n student-management
                    """
                } else {
                    bat """
                      ${kubectl} apply -f deployment.yaml -n student-management
                      ${kubectl} apply -f service.yaml -n student-management
                    """
                }

                // Update image safely
                if (isUnix()) {
                    sh """
                      ${kubectl} set image deployment/student-management \
                      student-management=${DOCKER_IMAGE}:${DOCKER_TAG} \
                      -n student-management
                    """
                } else {
                    bat """
                      ${kubectl} set image deployment/student-management ^
                      student-management=${DOCKER_IMAGE}:${DOCKER_TAG} ^
                      -n student-management
                    """
                }

                // Verify rollout
                bat "${kubectl} rollout status deployment/student-management -n student-management --timeout=120s"
                bat "${kubectl} get pods -n student-management"
                bat "${kubectl} get svc -n student-management"
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
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
        withKubeConfig([credentialsId: 'kubeconfig']) {
            script {
                // Image tag update (this part already works perfectly)
                def yamlContent = readFile 'deployment.yaml'
                def updatedContent = yamlContent.replaceAll('image: .*', "image: ${DOCKER_IMAGE}:${DOCKER_TAG}")
                writeFile file: 'deployment.yaml', text: updatedContent
                
                echo "Updated deployment.yaml image to: ${DOCKER_IMAGE}:${DOCKER_TAG}"

                // Use FULL PATH to kubectl (from Docker Desktop)
                def kubectlPath = 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\kubectl.exe'
                
                bat "${kubectlPath} apply -f deployment.yaml"
                bat "${kubectlPath} apply -f service.yaml"
                
                // Wait for rollout + show status
                bat "${kubectlPath} rollout status deployment/student-management --timeout=120s"
                bat "${kubectlPath} get pods -l app=student-management -o wide"
                bat "${kubectlPath} get svc student-management-service"
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
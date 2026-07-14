pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                echo '--- Checking out source code ---'
                checkout scm
                sh 'git log -1 --oneline'
            }
        }
        stage('Deploy') {
            steps {
                echo '--- Deploying application ---'
                sshagent(credentials: ['autoconnect-prod-ssh']) {
                    timeout(time: 10, unit: 'MINUTES') {
                        sh '''
                ssh -o StrictHostKeyChecking=no -o BatchMode=yes autoconnect@35.222.250.201 bash -s << 'EOF'
                set -e
                cd /home/kevin/quiz-challenge
                echo "Pulling latest code..."
                git pull origin main
                echo "Stopping old containers..."
                docker compose down
                echo "Building images..."
                docker compose build --no-cache backend frontend
                echo "Starting containers..."
                docker compose up -d
                echo "Waiting for PostgreSQL..."
                echo "Running migrations..."
                docker compose exec -T backend python manage.py migrate --noinput
                echo "Collecting static files..."
                docker compose exec -T backend python manage.py collectstatic --noinput --clear
                echo "=====================pipeline ended==============="
                EOF
                '''
                    }
                }
            }
        }
    }
}

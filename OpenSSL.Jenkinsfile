pipeline {
    environment {
        OPENSSL_VERSION="1.1.1"
        OPENSSL_BRANCH='OpenSSL_1_1_1-stable'
        CONFIGURE_PARAMS='no-idea no-camellia no-seed no-bf no-cast no-des no-rc2 no-rc4 no-rc5 \
        no-md2 no-md4 no-ripemd no-mdc2 no-dsa no-dh no-ec no-ecdsa no-ecdh no-sock \
        no-ssl2 no-ssl3 no-err no-engine no-hw'
    }
    agent {
        label 'master'
    }
    stages {
        stage('build') {
            parallel {
                stage('build linux') {
                    agent {
                        label 'linux'
                    }
                    steps {
                    	sh "rm -rf openssl" // Jenkins doesn't seem to use a clean workspace each time
                        sh "git clone git://git.openssl.org/openssl.git"
                        dir ("${WORKSPACE}/openssl") {
							sh "git checkout ${OPENSSL_BRANCH}"
							sh "perl ./Configure ${CONFIGURE_PARAMS}"
							sh "make build_generated && make libcrypto.a"
							sh "mv libcrypto.a libcrypto-linux.a"
							stash includes: 'libcrypto-linux.a', name: 'libcrypto-linux'
                        }
                    }
                }
                stage('build mac') {
                    agent {
                        label 'mac'
                    }
                    steps {
                    	sh "rm -rf openssl" // Jenkins doesn't seem to use a clean workspace each time
                        sh "git clone git://git.openssl.org/openssl.git"
						dir ("${WORKSPACE}/openssl") {
							sh "git checkout ${OPENSSL_BRANCH}"
							sh "perl ./Configure ${CONFIGURE_PARAMS}"
							sh "make build_generated && make libcrypto.a"
							sh "mv libcrypto.a libcrypto-mac.a"
							stash includes: 'libcrypto-mac.a', name: 'libcrypto-mac'
						}
                    }
                }
                stage('cross compile for windows') {
                    agent {
                        label 'linux'
                    }
                    steps {
                    	sh "rm -rf openssl" // Jenkins doesn't seem to use a clean workspace each time
                        sh "git clone git://git.openssl.org/openssl.git"
						dir ("${WORKSPACE}/openssl") {
							sh "git checkout ${OPENSSL_BRANCH}"
							sh "perl ./Configure --cross-compile-prefix=x86_64-w64-mingw32- mingw64 ${CONFIGURE_PARAMS}"
							sh "make build_generated && make libcrypto.a"
							sh "mv libcrypto.a libcrypto-win.a"
							stash includes: 'libcrypto-win.a', name: 'libcrypto-win'
                        }
                    }
                }
            }
        }
        stage('publish to nexus') {
            steps {
                unstash 'libcrypto-linux'
                unstash 'libcrypto-mac'
                unstash 'libcrypto-win'

				script {
					def util = load "jenkins-lib/util.groovy"

					util.publishToNexus(
						groupId: "lib",
						artifactId: "libcrypto",
						version: "${OPENSSL_VERSION}",
						assetFilePath: "${WORKSPACE}/libcrypto-linux.a",
						fileExtension: 'a'
					)
					util.publishToNexus(
						groupId: "lib",
						artifactId: "libcrypto",
						version: "${OPENSSL_VERSION}",
						assetFilePath: "${WORKSPACE}/libcrypto-mac.a",
						fileExtension: 'a'
					)
					util.publishToNexus(
						groupId: "lib",
						artifactId: "libcrypto",
						version: "${OPENSSL_VERSION}",
						assetFilePath: "${WORKSPACE}/libcrypto-win.a",
						fileExtension: 'a'
					)
				}
            }
        }
    }

	post {
		// Clean after build
		always {
			cleanWs(cleanWhenNotBuilt: true,
					deleteDirs: true,
					disableDeferredWipeout: true,
					notFailBuild: true,
					patterns: [[pattern: '.gitignore', type: 'INCLUDE']])
		}
	}
}

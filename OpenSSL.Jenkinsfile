pipeline {
    environment {
        OPENSSL_VERSION="1.1.1"
        OPENSSL_BRANCH='OpenSSL_1_1_1-stable'
        CONFIGURE_PARAMS="no-idea no-camellia no-seed no-bf no-cast no-des no-rc2 no-rc4 no-rc5 \
        no-md2 no-md4 no-ripemd no-mdc2 no-dsa no-dh no-ec no-ecdsa no-ecdh no-sock \
        no-ssl2 no-ssl3 no-err no-engine no-hw"
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
                   		build(platform: "linux", config: "")
                    }
                }
                stage('build mac') {
                    agent {
                        label 'mac'
                    }
                    steps {
						build(platform: "mac", config: "")
                    }
                }
                stage('cross compile for windows') {
                    agent {
                        label 'linux'
                    }
                    steps {
                    	echo "ignoring windows for now"
//                     	build(platform: "win", config: "--cross-compile-prefix=x86_64-w64-mingw32- mingw64")
                    }
                }
            }
        }
        stage('publish to nexus') {
            steps {
				script {
					publish("linux")
					publish("mac")
// 					publish("win")
				}
            }
        }
    }
}

def build(Map params) {
	sh "rm -rf openssl" // Jenkins doesn't seem to use a clean workspace each time
	sh "git clone git://git.openssl.org/openssl.git"
	script {
		dir ("${WORKSPACE}/openssl") {
			sh "git checkout ${OPENSSL_BRANCH}"
			sh "./config ${CONFIGURE_PARAMS} ${params.config}"
			sh "make build_generated && make libcrypto.a && make test"
			sh "mv libcrypto.a libcrypto-${params.platform}.a"
		}
		stash includes: '${WORKSPACE}/libcrypto-${params.platform}.a', name: "libcrypto-${params.platform}"
	}
}

def publish(String platform) {

	unstash 'libcrypto-${platform}'

	script {
		def util = load "jenkins-lib/util.groovy"

		util.publishToNexus(
			groupId: "lib",
			artifactId: "libcrypto",
			version: "${OPENSSL_VERSION}-${platform}",
			assetFilePath: "${WORKSPACE}/libcrypto-${platform}.a",
			fileExtension: 'a'
		)
	}

}

#!/bin/bash
#
# Copyright IBM Corp All Rights Reserved
#
# SPDX-License-Identifier: Apache-2.0
#
# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1
starttime=$(date +%s)

CC_RUNTIME_LANGUAGE=node # chaincode runtime language is node.js
CC_SRC_PATH=/opt/gopath/src/github.com/chaincode

# clean the keystore
rm -rf ./hfc-key-store

# clean the wallet
rm -rf ./wallet

# launch network; create channel and join peer to channel
cd ../my-network
echo y | ./start-network.sh down
echo y | ./start-network.sh up -a -n -s couchdb

CONFIG_ROOT=/opt/gopath/src/github.com/hyperledger/fabric/peer
ORG1_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/myOrg.example.com/users/Admin@myOrg.example.com/msp
ORG1_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/myOrg.example.com/peers/peer0.myOrg.example.com/tls/ca.crt
ORG2_MSPCONFIGPATH=${CONFIG_ROOT}/crypto/peerOrganizations/anotherOrg.example.com/users/Admin@anotherOrg.example.com/msp
ORG2_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/peerOrganizations/anotherOrg.example.com/peers/peer0.anotherOrg.example.com/tls/ca.crt
ORDERER_TLS_ROOTCERT_FILE=${CONFIG_ROOT}/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
set -x

echo "Installing smart contract on peer0.myOrg.example.com"
docker exec \
  -e CORE_PEER_LOCALMSPID=MyOrgMSP \
  -e CORE_PEER_ADDRESS=peer0.myOrg.example.com:7051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG1_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n leave \
    -v 1.0 \
    -p "$CC_SRC_PATH" \
    -l "$CC_RUNTIME_LANGUAGE"

echo "Installing smart contract on peer1.myOrg.example.com"
docker exec \
  -e CORE_PEER_LOCALMSPID=MyOrgMSP \
  -e CORE_PEER_ADDRESS=peer1.myOrg.example.com:8051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG1_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n leave \
    -v 1.0 \
    -p "$CC_SRC_PATH" \
    -l "$CC_RUNTIME_LANGUAGE"

echo "Installing smart contract on peer0.anotherOrg.example.com"
docker exec \
  -e CORE_PEER_LOCALMSPID=AnotherOrgMSP \
  -e CORE_PEER_ADDRESS=peer0.anotherOrg.example.com:9051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG2_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG2_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n leave \
    -v 1.0 \
    -p "$CC_SRC_PATH" \
    -l "$CC_RUNTIME_LANGUAGE"

echo "Installing smart contract on peer1.anotherOrg.example.com"
docker exec \
  -e CORE_PEER_LOCALMSPID=AnotherOrgMSP \
  -e CORE_PEER_ADDRESS=peer1.anotherOrg.example.com:10051 \
  -e CORE_PEER_MSPCONFIGPATH=${ORG2_MSPCONFIGPATH} \
  -e CORE_PEER_TLS_ROOTCERT_FILE=${ORG2_TLS_ROOTCERT_FILE} \
  cli \
  peer chaincode install \
    -n leave \
    -v 1.0 \
    -p "$CC_SRC_PATH" \
    -l "$CC_RUNTIME_LANGUAGE"

echo "Instantiating smart contract on mychannel"
docker exec \
  -e CORE_PEER_LOCALMSPID=MyOrgMSP \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  cli \
  peer chaincode instantiate \
    -o orderer.example.com:7050 \
    -C mychannel \
    -n leave \
    -l "$CC_RUNTIME_LANGUAGE" \
    -v 1.0 \
    -c '{"Args":[]}' \
    -P "AND('MyOrgMSP.member','AnotherOrgMSP.member')" \
    --tls \
    --cafile ${ORDERER_TLS_ROOTCERT_FILE} \
    --peerAddresses peer0.myOrg.example.com:7051 \
    --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE}

echo "Waiting for instantiation request to be committed ..."
sleep 10

echo "Submitting initLedger transaction to smart contract on mychannel"
echo "The transaction is sent to all of the peers so that chaincode is built before receiving the following requests"
docker exec \
  -e CORE_PEER_LOCALMSPID=MyOrgMSP \
  -e CORE_PEER_MSPCONFIGPATH=${ORG1_MSPCONFIGPATH} \
  cli \
  peer chaincode invoke \
    -o orderer.example.com:7050 \
    -C mychannel \
    -n leave \
    -c '{"function":"initLedger","Args":[]}' \
    --waitForEvent \
    --tls \
    --cafile ${ORDERER_TLS_ROOTCERT_FILE} \
    --peerAddresses peer0.myOrg.example.com:7051 \
    --peerAddresses peer1.myOrg.example.com:8051 \
    --peerAddresses peer0.anotherOrg.example.com:9051 \
    --peerAddresses peer1.anotherOrg.example.com:10051 \
    --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
    --tlsRootCertFiles ${ORG1_TLS_ROOTCERT_FILE} \
    --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE} \
    --tlsRootCertFiles ${ORG2_TLS_ROOTCERT_FILE}
set +x

cat <<EOF

Total setup execution time : $(($(date +%s) - starttime)) secs ...

EOF

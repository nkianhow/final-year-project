#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $6)
    local CP=$(one_line_pem $7)
    sed -e "s/\${ORGMSP}/$1/" \
        -e "s/\${ORG}/$2/" \
        -e "s/\${P0PORT}/$3/" \
        -e "s/\${P1PORT}/$4/" \
        -e "s/\${CAPORT}/$5/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.json 
}

ORGMSP="Provider"
ORG="provider"
P0PORT=7051
P1PORT=8051
CAPORT=7054
PEERPEM=crypto-config/peerOrganizations/provider.example.com/tlsca/tlsca.provider.example.com-cert.pem
CAPEM=crypto-config/peerOrganizations/provider.example.com/ca/ca.provider.example.com-cert.pem

echo "$(json_ccp $ORGMSP $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > connection-provider.json

ORGMSP="Consumer"
ORG="consumer"
P0PORT=9051
P1PORT=10051
CAPORT=8054
PEERPEM=crypto-config/peerOrganizations/consumer.example.com/tlsca/tlsca.consumer.example.com-cert.pem
CAPEM=crypto-config/peerOrganizations/consumer.example.com/ca/ca.consumer.example.com-cert.pem

echo "$(json_ccp $ORGMSP $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > connection-consumer.json

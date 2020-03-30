# kafka-connect-sftp
# Introduction

This project provides connectors for Kafka Connect to read and write data to configured SFTP server directory.

# Running Locally

1. Ensure that you have confluent platform installed. Also ensure that confluent bin directory is in your path
2. Clone or download the project from the following link https://github.com/confluentinc/kafka-connect-sftp
3. Run mvn clean install

# Documentation

Documentation on the connector is hosted on Confluent's
[docs site](https://docs.confluent.io/current/connect/kafka-connect-sftp/).

Source code is located in Confluent's
[docs repo](https://github.com/confluentinc/docs/tree/master/connect/kafka-connect-sftp). If changes
are made to configuration options for the connector, be sure to generate the RST docs (as described
below) and open a PR against the docs repo to publish those changes!

# Configs

Documentation on the configurations for each connector can be automatically generated via Maven.

To generate documentation for the sink connector:
```bash
mvn -Pdocs exec:java@sink-config-docs
```

To generate documentation for the source connector:
```bash
mvn -Pdocs exec:java@source-config-docs
```

### Proxy Server Setup

1. SFTP server setup over GCP VM Instance.
2. Proxy server over AWS EC2.
3. Blocked all traffic to port 22 except for proxy server setup at AWS using iptables.
                        iptables -A INPUT -p tcp --dport 22 --source <"IP_of_AWS_proxy"> -j ACCEPT
                        iptables -A INPUT -p tcp --dport 22 -j DROP5.
4. Add the proxy settings to your local machine (AWS proxy instance)
5. Ran the connector using the following proxy configs.

```
sftp.proxy.url=http://someurl:9091
sftp.proxy.username=user1
sftp.proxy.password=****
```

# Compatibility Matrix:

This connector has been tested against the following versions of Apache Kafka
and Kafka Connect Sftp:

|                          | AK 1.0             | AK 1.1        | AK 2.0        |
| ------------------------ | ------------------ | ------------- | ------------- |
| **kafka-connect-sftp**   | NOT COMPATIBLE (1) | OK            | OK            |

1. The connector needs header support in Connect.


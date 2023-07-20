export interface Response {
  statusCode: number;
  body: string;
}

export const handler = async () => {
  const data = {
    keys: [
      {
        kty: "EC",
        use: "sig",
        crv: "P-256",
        kid: "f02aec21220ef7b502e6396304345a7b87cffbdc4239ed09a136b164c6cf8e30",
        x: "qBwa5L5ZA33RortEjaQ8_lwrVd-EE2eVsgOC84VwyVQ",
        y: "ONF88GoP9xQJtq8RRV6zquggcd7xtggzZ20yW-PljHE",
        alg: "ES256",
      },
      {
        kty: "EC",
        use: "sig",
        crv: "P-256",
        kid: "a644d1fbfd32daaadd1e272e3ad0035a97483608c8f716651a744a90740d1192",
        x: "UU31CWW6ub_GMbfKGNvIlQ1-0VmoR_K9OUdDc3aZSjs",
        y: "OK9dPQ-qYNNe2tVp4mSyGRp_WzREfYaL9xUGEAZF17U",
        alg: "ES256",
      },
      {
        kty: "RSA",
        e: "AQAB",
        use: "sig",
        kid: "9523e2842d6da6d5ab8cf860c9972edc4dd9931e78191863a423c8e0a3672edc",
        alg: "RS256",
        n: "szPJQdwSk6hfrForvDfxi8NUp64nN2svpQIY1yqO80FH7N-YLe0U5lBRAtMMDd0J0PeL5lqn11fIMMRZv0qgx6V5vTOZPALNMHIVvFFqqJISUi56975jzdMn5og-I35bgmNuupLwtmQQWezFoZK7Y21iNK21Iz82wLbfQf7vJiHbtq7eGtOEAzzayH_0OgEk0TyeULErMZy3_GN12njmNiBDxDw5hC8r3euoGCBVlC68Jc8Id7QSn7QMsakXWfnyboVQQtdzvbSfHFNf4jW6lqsb-3lMZxDOSBkPmrJTnGbFauJDXArnTk7YAprDnnoc_S5pXvwNZWJPX7IFugwGbqsFRwTPqWL8iWBc0JXsx02T5p6wf1ZEuyjNVZn4FMT_EHjYnFVIkaFhR9Ad3NZikHkNMDCf_1l8JOXiZ-l0BWqwfAiz9eiFAwM4LgdQviZmFdJZ7-A82lQwNzeqj8L4g5EB_DECWMVVD8YHXy7gs8FLfnuj9QRCDaConl0RkZfgoFeK8ayhbVhfQlDRTrDb9yrpK8RRS3vvfcImoj26gqWphMXcbEagfriTYLg5AZLzT1svraGnqS5cu6_XbDjzP-62tMRA_9-QSoCZqwBqjxd04cZZIanHJXBzVDNfcDFBFPwQ4Rt_ZifC8G0SvxleXXlRxeceq4rj3gNUYQugK4s",
      },
    ],
  };

  const response = {
    statusCode: 200,
    body: JSON.stringify(data),
  };

  return response;
};

const subsystems = [
  "batch-jberet",
  "bean-validation",
  "core-management",
  "datasources",
  "datasources-agroal",
  "deployment-scanner",
  "discovery",
  "distributable-ejb",
  "distributable-web",
  "ee",
  "ee-security",
  "ejb3",
  "elytron",
  "elytron-oidc-client",
  "health",
  "iiop-openjdk",
  "infinispan",
  "io",
  "jaxrs",
  "jca",
  "jdr",
  "jgroups",
  "jmx",
  "jpa",
  "jsf",
  "logging",
  "mail",
  "messaging-activemq",
  "metrics",
  "micrometer",
  "microprofile-config-smallrye",
  "microprofile-fault-tolerance-smallrye",
  "microprofile-jwt-smallrye",
  "microprofile-openapi-smallrye",
  "microprofile-telemetry",
  "modcluster",
  "naming",
  "opentelemetry",
  "pojo",
  "remoting",
  "request-controller",
  "resource-adapters",
  "rts",
  "sar",
  "security-manager",
  "singleton",
  "transactions",
  "undertow",
  "webservices",
  "weld"
];

const Datalist = ({ inputRef, ...config }) => {
  const options = [];
  subsystems.forEach(i => options.push(<option value={`subsystem/${i}`} />));

  return (
    <>
      <input ref={inputRef} {...config} list="subsystems" />
      <datalist id="subsystems">
        { options }
      </datalist>
    </>
  )
}

export default Datalist
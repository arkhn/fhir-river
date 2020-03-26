import java.text.SimpleDateFormat
import java.util.{Date, TimeZone}

import sbt.{Credentials, addArtifact}
import sbt.Keys.{credentials, publishTo}
import sbtrelease._

val VersionRegex = "([0-9]+.[0-9]+.[0-9]+)-?(.*)?".r

lazy val root = (project in file("."))
  .enablePlugins(GitVersioning)
  .enablePlugins(BuildInfoPlugin)
  .enablePlugins(
    JavaServerAppPackaging,
    SystemdPlugin,
    DockerPlugin,
    AshScriptPlugin
  )
  .settings(
    organization := "com.stuart",
    scalaVersion := "2.12.4",
    name := "console-tools",
    libraryDependencies ++= Seq(
      "com.stuart" %% "business-events" % "2.6.0" exclude ("org.slf4j", "slf4j-log4j12"),
      "net.cakesolutions" %% "scala-kafka-client-akka" % "0.11.0.1",
      "com.github.scopt" %% "scopt" % "3.7.0",
      "com.typesafe.scala-logging" %% "scala-logging" % "3.5.0",
      "ch.qos.logback" % "logback-classic" % "1.2.3"
    ),
    mainClass := Some("com.stuart.events.utils.KafkaConsoleTool"),
    buildInfoKeys := Seq[BuildInfoKey](
      name,
      version,
      git.gitHeadCommit,
      scalaVersion,
      sbtVersion,
      libraryDependencies in Compile
    ),
    buildInfoPackage := "com.stuart.dispatcher",
    buildInfoOptions ++= Seq(BuildInfoOption.ToJson, BuildInfoOption.BuildTime),
    // Release process
    git.useGitDescribe := true,
    git.gitTagToVersionNumber := {
      case VersionRegex(v, "") => Some(v)
      case VersionRegex(v, _) =>
        val nextRelease = Version(v)
          .map(_.bumpMinor.asSnapshot.string)
          .getOrElse(s"Version error format. Invalid $v")
        Some(s"$nextRelease")
      case _ => None
    },
    // Nexus
    resolvers ++= Seq(
      "Stuart's Public" at "http://nexus.internal.stuart.com:8081/repository/maven-public/"
    ),
    credentials += Credentials(sys.env.get("HOME").map(new java.io.File(_)).getOrElse(Path.userHome) / ".ivy2" / ".credentials"),
    publishTo := {
      val nexus = "http://nexus.internal.stuart.com:8081/"
      if (isSnapshot.value)
        Some("snapshots" at nexus + "repository/maven-snapshots")
      else
        Some("releases" at nexus + "repository/maven-releases")
    },
    // Docker Packaging
    packageName in Docker := System
      .getProperty("docker.name", "events-console-tools"),
    version in Docker := System.getProperty(
      "docker.tag",
      git.gitHeadCommit.value.map(_.substring(0, 8)).getOrElse("unknown")
    ),
    dockerBaseImage := "openjdk:8-jre",
    dockerRepository := Option(System.getProperty("docker.repo")),
    dockerLabels := Map(
      "com.stuart.build-date" -> {
        val tz = TimeZone.getTimeZone("UTC")
        val df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'")
        df.setTimeZone(tz)
        df.format(new Date())
      },
      "com.stuart.name" -> "events-console-tools",
      "com.stuart.vcs-url" -> "https://github.com/StuartApp/business-events",
      "com.stuart.vcs-ref" -> git.gitHeadCommit.value
        .map(_.substring(0, 8))
        .getOrElse("unknown"),
      "com.stuart.version" -> git.gitHeadCommit.value
        .map(_.substring(0, 8))
        .getOrElse("unknown")
    ),
    // Publish assembly jar
    artifact in (Compile, assembly) ~= { art =>
      art.copy(`classifier` = Some("assembly"))
    },
    addArtifact(artifact in (Compile, assembly), assembly)
  )

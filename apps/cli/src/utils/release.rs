use anyhow::Result;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct GitHubRelease {
    pub tag_name: String,
    pub name: Option<String>,
    pub body: Option<String>,
    pub html_url: Option<String>,
    pub prerelease: bool,
}

#[derive(Debug)]
#[allow(dead_code)]
pub struct ReleaseInfo {
    pub current_version: String,
    pub latest_version: String,
    pub has_update: bool,
    pub is_prerelease: bool,
    pub release_name: Option<String>,
    pub release_url: Option<String>,
    pub release_notes: Option<String>,
}

pub fn check_latest_release(current_version: &str) -> Result<ReleaseInfo> {
    let client = reqwest::blocking::Client::builder()
        .user_agent("amoeba-cli")
        .timeout(std::time::Duration::from_secs(5))
        .build()?;

    let url = "https://api.github.com/repos/Sruhvx-jpg/amoeba/releases/latest";
    let resp = client.get(url).send();

    let (latest_version, is_prerelease, release_name, release_url, release_notes) = match resp {
        Ok(res) if res.status().is_success() => {
            if let Ok(release) = res.json::<GitHubRelease>() {
                let tag = release.tag_name.trim_start_matches('v').to_string();
                (
                    tag,
                    release.prerelease,
                    release.name,
                    release.html_url,
                    release.body,
                )
            } else {
                (current_version.to_string(), false, None, None, None)
            }
        }
        _ => (current_version.to_string(), false, None, None, None),
    };

    let has_update = latest_version != current_version && !latest_version.is_empty();

    Ok(ReleaseInfo {
        current_version: current_version.to_string(),
        latest_version,
        has_update,
        is_prerelease,
        release_name,
        release_url,
        release_notes,
    })
}

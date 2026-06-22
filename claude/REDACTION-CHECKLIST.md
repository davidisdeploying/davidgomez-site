# Devblog redaction checklist

A post must make sense to a stranger AND give (a) zero operational uplift to anyone trying to
find or attack the machines, and (b) zero exposure to the employer. Before any draft leaves
`drafts/`, strip or replace everything below. When in doubt, leave it out.

## Network & infrastructure
- LAN/private IPs: `192.168.*`, `10.*`, `172.16-31.*`, Tailscale CGNAT `100.64.0.0/10`.
- Hostnames, MagicDNS names (`*.ts.net`), the Cloudflare tunnel hostname, port numbers.
- The NAS, the Mac mini, machine names, mount points.
- Absolute filesystem paths (`/home/...`, `/Users/...`, `/mnt/...`, `~/loupe/...`). Talk about
  *what* a thing does, not where it lives on disk.

## Security mechanics
- How access is gated (LAN-gating logic, the `_is_local`/`_is_lan_peer` internals), iCloud
  credential handling, the relay permission rules.
- Any token, password, API key, app-specific password, or session secret.
- Describe outcomes ("only reachable on my home network"), never exploitable detail.

## Employer & work
- Anything that identifies the employer, its customers, contracts, SOPs, programs, or
  defense-supply-chain specifics. The day job is **not** source material for the blog unless
  David has explicitly cleared a specific, already-public item.

## Sensitive features & people
- The NSFW / nudity-screening feature: do **not** mention it unless David explicitly clears it.
- Real names of people in the photo library, family details, home address, phone, Apple ID/email.
- Anything under NDA or that could embarrass a third party.

## In the report
List every redaction made, so David can confirm nothing slipped through.

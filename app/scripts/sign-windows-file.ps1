param([Parameter(Mandatory = $true)][string]$Path)

$ErrorActionPreference = 'Stop'
Import-Module Microsoft.PowerShell.Security
$thumbprint = $env:WYRE_WINDOWS_CERTIFICATE_THUMBPRINT
if (-not $thumbprint) { throw 'Wyre signing certificate thumbprint is missing.' }
$certificate = Get-Item "Cert:\CurrentUser\My\$thumbprint"
if (-not $certificate.HasPrivateKey -or $certificate.Subject -notmatch 'CN=bxane') {
  throw 'The Wyre signing certificate must have a private key and identify bxane.'
}
Set-AuthenticodeSignature -LiteralPath $Path -Certificate $certificate -TimestampServer 'http://timestamp.digicert.com' -HashAlgorithm SHA256 | Out-Null
$signature = Get-AuthenticodeSignature -LiteralPath $Path
if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Thumbprint -ne $thumbprint) {
  throw "Wyre file signing failed: $($signature.Status)"
}

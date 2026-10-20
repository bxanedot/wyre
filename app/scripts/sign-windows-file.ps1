param([Parameter(Mandatory = $true)][string]$Path)

$ErrorActionPreference = 'Stop'
Import-Module Microsoft.PowerShell.Security
$thumbprint = $env:WYRE_WINDOWS_CERTIFICATE_THUMBPRINT
if (-not $thumbprint) { throw 'Wyre signing certificate thumbprint is missing.' }
$certificate = Get-Item "Cert:\CurrentUser\My\$thumbprint"
if (-not $certificate.HasPrivateKey -or $certificate.Subject -notmatch 'CN=bxane') {
  throw 'The Wyre signing certificate must have a private key and identify bxane.'
}
$signingParameters = @{
  LiteralPath = $Path
  Certificate = $certificate
  HashAlgorithm = 'SHA256'
}
if ($env:WYRE_CI_EPHEMERAL_SIGNING -ne 'true') {
  $signingParameters.TimestampServer = 'http://timestamp.digicert.com'
}
Set-AuthenticodeSignature @signingParameters | Out-Null
$signature = Get-AuthenticodeSignature -LiteralPath $Path
$signerMatches = ($null -ne $signature.SignerCertificate) -and ($signature.SignerCertificate.Thumbprint -eq $thumbprint)
if ($env:WYRE_CI_EPHEMERAL_SIGNING -eq 'true') {
  if (($signature.Status.ToString() -notin @('Valid', 'NotTrusted')) -or -not $signerMatches) {
    throw "Wyre CI file signature failed: $($signature.Status)"
  }
} elseif ($signature.Status -ne 'Valid' -or -not $signerMatches) {
  throw "Wyre file signing failed: $($signature.Status)"
}

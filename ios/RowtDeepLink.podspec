require 'json'
package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name         = "RowtDeepLink"
  s.version      = package['version']
  s.summary      = "Deep linking for Rowt SDK"
  s.description  = package['description']
  s.homepage     = package['homepage'] || "https://github.com/yourusername/rowt-sdk"
  s.license      = package['license']
  s.authors      = { "Your Company" => "dev@yourcompany.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => package['repository']['url'], :tag => "v#{s.version}" }
  s.source_files = "RowtDeepLink/**/*.{h,m,mm}"
  s.requires_arc = true
  s.dependency "React-Core"
end
import UIKit
import WebKit

class WebViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    // JS -> iOS 메시지 수신
    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        if message.name == "dutymateiOSApp" {
            print("📩 JS로부터 메시지 수신: \(message.body)")
        }
    }
    
    var webView: WKWebView!
    
    // 엣지 색상 정의
    let orangeColor = UIColor(red: 252 / 255.0, green: 227 / 255.0, blue: 217 / 255.0, alpha: 1.0)
    let grayColor = UIColor(red: 244 / 255.0, green: 244 / 255.0, blue: 244 / 255.0, alpha: 1.0)
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let contentController = WKUserContentController()
        
        // 1. JS 브릿지 등록
        contentController.add(self, name: "dutymateiOSApp")
        
        // 2. 설정
        let config = WKWebViewConfiguration()
        config.userContentController = contentController
        config.applicationNameForUserAgent = "Dutymate_iOSApp/1.0"
        
        
        // --- 2. (수정) Auto Layout으로 웹뷰 초기화 ---
        // 'frame'을 사용하지 않고 Auto Layout을 사용하도록 변경
        webView = WKWebView(frame: .zero, configuration: config)
        
        // 웹뷰의 배경을 투명하게 만들어, 뒤의 뷰 컨트롤러 색상이 보이게 함
        webView.isOpaque = false
        webView.backgroundColor = .clear
        
        webView.isInspectable = true
        
        // 웹뷰의 네비게이션 이벤트를 self(이 클래스)가 받도록 설정
        webView.navigationDelegate = self
        
        webView.uiDelegate = self // (이미 conform 하고 계시므로 추가)
        
        // Auto Layout을 사용하기 위해 false로 설정
        webView.translatesAutoresizingMaskIntoConstraints = false
        
        // 웹뷰 뒤로가기 제스처 활성화
        webView.allowsBackForwardNavigationGestures = true
        
        view.addSubview(webView)
        
        // --- 3. Auto Layout 제약 조건 설정 ---
        // ⭐️ 웹뷰를 'Safe Area(안전 영역)'에 꽉 차게 배치합니다.
        let safeArea = view.safeAreaLayoutGuide
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: safeArea.topAnchor),
            webView.bottomAnchor.constraint(equalTo: safeArea.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: safeArea.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: safeArea.trailingAnchor)
        ])
        
        // ⭐️ 뷰 컨트롤러의 기본 배경색(엣지 색상)을 오렌지색으로 설정
        self.view.backgroundColor = orangeColor
        
        let urlString = "http://localhost:5173?env=iosapp"
        if let url = URL(string: urlString) {
            let request = URLRequest(url: url)
            webView.load(request)
        }
    }
    
    // 웹뷰가 페이지 로드를 완료할 때마다 호출됩니다.
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        // 현재 URL의 '경로(path)'를 확인합니다.
        guard let path = webView.url?.path else {
            self.view.backgroundColor = orangeColor // URL 없으면 오렌지색
            return
        }
        
        print("Webview DIdFinish, path: \(path)")
        
        // 주황색으로 표시할 경로 목록
        let orangePaths = ["/", "/login", "/sign-up" , "/password-reset"]
        
        // 경로에 따라 뷰 컨트롤러의 배경색(엣지 색상)을 변경
        if orangePaths.contains(path) {
            self.view.backgroundColor = orangeColor
        } else {
            self.view.backgroundColor = grayColor
        }
    }
    
    
    func webView(_ webView: WKWebView,
                 decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        defer { decisionHandler(.allow) }
        
        // 서브프레임/리소스 요청(이미지 등)은 무시
        guard navigationAction.targetFrame?.isMainFrame == true else { return }
        
        guard let url = navigationAction.request.url,
              let scheme = url.scheme?.lowercased(),
              scheme == "http" || scheme == "https" else { return }
        
        let path = url.path.isEmpty ? "/" : url.path
        let orangePaths: Set<String> = ["/", "/login", "/sign-up", "/password-reset"]
        
        if orangePaths.contains(path) {
            self.view.backgroundColor = orangeColor
        } else {
            self.view.backgroundColor = grayColor
        }
    }
    
    
    
}

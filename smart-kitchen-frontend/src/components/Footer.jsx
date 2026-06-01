import "./Footer.css";

function Footer() {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="footer-left">
                    <div className="footer-logo-circle">
                        SK
                    </div>

                    <div>
                        <h2>Smart Kitchen Project</h2>
                        <p>Cook smarter, waste less.</p>
                    </div>
                </div>

                <div className="footer-right">
                    <span>© 2026</span>
                    <strong>Lior Rubinshtein and Ellen Levin</strong>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
import React, {FunctionComponent} from 'react';
import config from "../config/config";

interface OwnProps {
}

type Props = OwnProps;

export const FooterComponent: FunctionComponent<Props> = (props) => {

    // <div classNameName="footer">
    //     <p>The goal of this project was to learn react. All the sources for the site and the API are checked in
    //         on <a href="https://github.com/mircohaug/reddit-compiler" target="_blank">Github</a>.</p>
    //     <p>The used api can be explored <a href={config.BACKEND_HOST + "/docs"}>here</a></p>
    // </div>
    // <!-- Footer -->
    return (
        <footer className="pt-4 my-md-5 pt-md-5 border-top">
            <div className="row">
                <div className="col-6 col-md">
                    <p>I frequently stumbled upon new series on reddit but to read the full series I had to navigate to
                        all the chapters manually and frequently lost the reading progress by accidentally closing the
                        tab etc. Therefor I implmented a way to compile a whole series of posts (identified by a common
                        prefix) into one epub file. <br/> Enjoy!</p>
                    <p>The goal of this project is learning react. All the sources for the site and the API are checked
                        in on <a href="https://github.com/mircohaug/reddit-compiler" target="_blank">Github</a>.</p>
                    <p>The used api can be explored <a href={config.BACKEND_HOST + "/docs"}>here</a></p>
                    <p>This project uses the GPLv3 License. All content belongs to the original authors.</p>
                </div>
            </div>
        </footer>
    );
};
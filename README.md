# node-fdsh-client-lambda
A Node.js client for the Federal Data Services Hub (FDSH) designed for AWS Lambda.

This is basically a lightweight wrapper around the
[`fdsh-client` Node package](https://www.npmjs.com/package/fdsh-client)
that allows it to be executed by [AWS Lambda](https://aws.amazon.com/lambda/).

### TODO
* tests
* local development test -- currently an uncommitted test.js w/ secrets in it (create some kind of .env system)
* other tasks noted in the code
* document how to setup Lambda (and optionally API Gateway)

### Tips
* compile (`npm install`) on an AWS Linux EC2 instance before zipping for deployment, otherwise you may see runtime failures (too bad Lambda doesn't handle the npm install for us on its native architecture)
*

### Public domain

This project is in the worldwide [public domain](LICENSE.md). As stated in [CONTRIBUTING](CONTRIBUTING.md):

> This project is in the public domain within the United States, and copyright and related rights in the work worldwide are waived through the [CC0 1.0 Universal public domain dedication](https://creativecommons.org/publicdomain/zero/1.0/).
>
> All contributions to this project will be released under the CC0 dedication. By submitting a pull request, you are agreeing to comply with this waiver of copyright interest.

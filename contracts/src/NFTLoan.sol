// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTLoan is ReentrancyGuard, Ownable {
    struct Loan {
        address borrower;
        address lender;
        uint256 tokenId;
        uint256 loanAmount;
        uint256 interestRate; // 年化利率（基点，100 = 1%）
        uint256 startTime;
        uint256 dueDate;
        uint256 repaymentAmount;
        bool active;
        bool repaid;
    }

    IERC721 public nftContract;
    mapping(uint256 => Loan) public loans;
    uint256 public loanIdCounter;
    uint256 public defaultInterestRate = 1000; // 10% 年化
    uint256 public minLoanDuration = 7 days;
    uint256 public maxLoanDuration = 365 days;

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 indexed tokenId,
        uint256 loanAmount,
        uint256 duration
    );
    event LoanFulfilled(uint256 indexed loanId, address indexed lender);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower, uint256 amount);
    event LoanDefaulted(uint256 indexed loanId);

    constructor(address _nftContract) Ownable(msg.sender) {
        nftContract = IERC721(_nftContract);
    }

    function createLoan(
        uint256 tokenId,
        uint256 loanAmount,
        uint256 duration
    ) external nonReentrant {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not the owner");
        require(duration >= minLoanDuration && duration <= maxLoanDuration, "Invalid duration");
        require(loanAmount > 0, "Amount must be greater than 0");

        // 检查是否已有活跃的借贷
        require(!loans[loanIdCounter].active, "Previous loan still active");

        uint256 loanId = loanIdCounter++;
        uint256 interest = (loanAmount * defaultInterestRate * duration) / (365 days * 10000);
        uint256 repaymentAmount = loanAmount + interest;

        // 转移 NFT 到借贷合约作为抵押
        nftContract.transferFrom(msg.sender, address(this), tokenId);

        loans[loanId] = Loan({
            borrower: msg.sender,
            lender: address(0),
            tokenId: tokenId,
            loanAmount: loanAmount,
            interestRate: defaultInterestRate,
            startTime: 0,
            dueDate: block.timestamp + duration,
            repaymentAmount: repaymentAmount,
            active: true,
            repaid: false
        });

        emit LoanCreated(loanId, msg.sender, tokenId, loanAmount, duration);
    }

    function fulfillLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.lender == address(0), "Loan already fulfilled");
        require(msg.value >= loan.loanAmount, "Insufficient amount");

        loan.lender = msg.sender;
        loan.startTime = block.timestamp;
        loan.dueDate = block.timestamp + (loan.dueDate - block.timestamp);

        // 支付给借款人
        (bool success, ) = payable(loan.borrower).call{value: loan.loanAmount}("");
        require(success, "Payment failed");

        // 退还多余金额
        if (msg.value > loan.loanAmount) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - loan.loanAmount}("");
            require(refundSuccess, "Refund failed");
        }

        emit LoanFulfilled(loanId, msg.sender);
    }

    function repayLoan(uint256 loanId) external payable nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.borrower == msg.sender, "Not the borrower");
        require(loan.lender != address(0), "Loan not fulfilled");
        require(!loan.repaid, "Already repaid");
        require(msg.value >= loan.repaymentAmount, "Insufficient repayment");

        loan.repaid = true;
        loan.active = false;

        // 归还 NFT 给借款人
        nftContract.transferFrom(address(this), loan.borrower, loan.tokenId);

        // 支付给贷款人
        (bool success, ) = payable(loan.lender).call{value: loan.repaymentAmount}("");
        require(success, "Payment failed");

        // 退还多余金额
        if (msg.value > loan.repaymentAmount) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - loan.repaymentAmount}("");
            require(refundSuccess, "Refund failed");
        }

        emit LoanRepaid(loanId, msg.sender, loan.repaymentAmount);
    }

    function claimCollateral(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.active, "Loan not active");
        require(loan.lender == msg.sender, "Not the lender");
        require(block.timestamp > loan.dueDate, "Loan not due");
        require(!loan.repaid, "Loan repaid");

        loan.active = false;

        // 将 NFT 转移给贷款人（清算）
        nftContract.transferFrom(address(this), loan.lender, loan.tokenId);

        emit LoanDefaulted(loanId);
    }

    function getLoanInfo(uint256 loanId) external view returns (
        address borrower,
        address lender,
        uint256 amount,
        uint256 dueDate,
        bool repaid
    ) {
        Loan memory loan = loans[loanId];
        return (
            loan.borrower,
            loan.lender,
            loan.loanAmount,
            loan.dueDate,
            loan.repaid
        );
    }

    receive() external payable {}

    function updateInterestRate(uint256 _rate) external onlyOwner {
        require(_rate <= 5000, "Rate too high"); // 最大 50%
        defaultInterestRate = _rate;
    }

    function updateLoanDuration(uint256 _min, uint256 _max) external onlyOwner {
        minLoanDuration = _min;
        maxLoanDuration = _max;
    }
}


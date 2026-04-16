// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VeriCredit is ERC1155, Ownable, ReentrancyGuard {
    uint256 public currentTokenId;
    uint256 public currentListingId;

    struct CCTSMetadata {
        string schemeType; // "compliance" or "offset"
        uint256 additionalityScore; // Placeholder for Vertex Generative AI score
        bool beeExportFlag; // Flag for Bureau of Energy Efficiency export
        string ipfsProjectURI; // Link to project data on IPFS
        uint256 mintedAt;
        bool retired;
    }

    struct Listing {
        uint256 listingId;
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerToken;
        bool active;
    }

    mapping(uint256 => CCTSMetadata) public creditDetails;
    mapping(uint256 => Listing) public listings;

    event CreditMinted(uint256 indexed tokenId, address indexed minter, uint256 amount);
    event CreditRetired(uint256 indexed tokenId, address indexed retier, uint256 amount, string complianceCertificateURI);
    event CreditListed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 amount, uint256 price);
    event CreditBought(uint256 indexed listingId, address indexed buyer, uint256 amount);

    constructor() ERC1155("") Ownable(msg.sender) {}

    function mintCredit(
        address account,
        uint256 amount,
        string memory _schemeType,
        uint256 _additionalityScore,
        bool _beeExportFlag,
        string memory _ipfsProjectURI
    ) public onlyOwner returns (uint256) {
        currentTokenId++;
        uint256 newItemId = currentTokenId;

        creditDetails[newItemId] = CCTSMetadata({
            schemeType: _schemeType,
            additionalityScore: _additionalityScore,
            beeExportFlag: _beeExportFlag,
            ipfsProjectURI: _ipfsProjectURI,
            mintedAt: block.timestamp,
            retired: false
        });

        _mint(account, newItemId, amount, "");
        emit CreditMinted(newItemId, account, amount);

        return newItemId;
    }

    function listCredit(uint256 tokenId, uint256 amount, uint256 pricePerToken) public {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(isApprovedForAll(msg.sender, address(this)), "Marketplace contract not approved to handle tokens");
        require(!creditDetails[tokenId].retired, "Cannot list retired tokens");

        currentListingId++;
        listings[currentListingId] = Listing({
            listingId: currentListingId,
            seller: msg.sender,
            tokenId: tokenId,
            amount: amount,
            pricePerToken: pricePerToken,
            active: true
        });

        emit CreditListed(currentListingId, msg.sender, tokenId, amount, pricePerToken);
    }

    function buyCredit(uint256 listingId, uint256 amountToBuy) public payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.active, "Listing not active");
        require(listing.amount >= amountToBuy, "Not enough tokens in listing");
        require(msg.value >= (listing.pricePerToken * amountToBuy), "Insufficient funds");

        listing.amount -= amountToBuy;
        if (listing.amount == 0) {
            listing.active = false;
        }

        // Transfer funds to seller
        payable(listing.seller).transfer(msg.value);

        // Transfer tokens to buyer
        _safeTransferFrom(listing.seller, msg.sender, listing.tokenId, amountToBuy, "");

        emit CreditBought(listingId, msg.sender, amountToBuy);
    }

    function retireCredit(uint256 tokenId, uint256 amount, string memory certificateURI) public {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        require(!creditDetails[tokenId].retired, "Already fully retired");

        _burn(msg.sender, tokenId, amount);
        
        creditDetails[tokenId].retired = true; // For simplicity. In production handle fractional retirements in mapping.
        emit CreditRetired(tokenId, msg.sender, amount, certificateURI);
    }

    function getCreditDetails(uint256 tokenId) public view returns (CCTSMetadata memory) {
        return creditDetails[tokenId];
    }
}
